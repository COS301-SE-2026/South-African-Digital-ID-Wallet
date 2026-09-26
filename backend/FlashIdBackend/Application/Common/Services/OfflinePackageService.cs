using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Globalization;
using System.Text.Encodings.Web;
using System.Text.Json.Nodes;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Enums;
using Application.Features.Credentials.Exceptions;
using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Services;

// Facade over the pieces an offline package needs: field lookup, photo storage, the portrait processor, the credential factory and the repository. Controller calls one method.
public sealed class OfflinePackageService : IOfflinePackageService
{
    // A package older than this is re-minted even though it has not expired, so a revoked credential stops verifying within about a week rather than a month.
    private static readonly TimeSpan RefreshAfter = TimeSpan.FromDays(7);

    // Concurrent mints read the same highest index, so one loses and retries with a fresh number. Jitter spreads the losers out. Without it, they collide with each other again in lockstep
    private const int MaxMintAttempts = 4;
    private const int MinRetryDelayMs = 10;
    private const int MaxRetryDelayMs = 40;

    private const string Issuer = "urn:flashid:issuer";
    private const string RevocationListType = "revocation-list+jwt";
    // A day before a verifier is told its list is stale, matching the 24-hour trust data warning (D-009).
    private static readonly TimeSpan RevocationListLifetime = TimeSpan.FromHours(24);
    private static readonly JsonSerializerOptions WireJsonOptions = new()
    {
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    private const int MaxOfflineVerificationsPerBatch = 100;
    private const string VerifiedResult = "VERIFIED";
    private static readonly long MaxUnixSeconds = DateTimeOffset.MaxValue.ToUnixTimeSeconds();
    // Mirrors VerificationFailureCode in the wallet's verify.ts, plus VERIFIED.
    private static readonly HashSet<string> KnownVerificationResults = new(StringComparer.Ordinal)
    {
        VerifiedResult, "MALFORMED", "UNSUPPORTED_ALG", "UNKNOWN_KEY", "REVOKED_KEY", "BAD_ISSUER_SIGNATURE",
        "EXPIRED", "CREDENTIAL_REVOKED", "DISCLOSURE_NOT_IN_SD", "DUPLICATE_DISCLOSURE", "MISSING_MANDATORY_CLAIM",
        "MISSING_KEY_BINDING", "BAD_KEY_BINDING_SIGNATURE", "SD_HASH_MISMATCH", "STALE_PRESENTATION", "STALE_TRUST_DATA",
    };

    private readonly IOfflinePackageRepository _repository;
    private readonly IDisclosedFieldsValueResolver _fieldResolver;
    private readonly IPhotoStorageProvider _photoStorage;
    private readonly IPortraitProcessor _portraitProcessor;
    private readonly ISdJwtCredentialFactory _credentialFactory;
    private readonly ICredentialSigningProvider _signingProvider;
    private readonly TimeProvider _timeProvider;

    public OfflinePackageService(
        IOfflinePackageRepository repository,
        IDisclosedFieldsValueResolver fieldResolver,
        IPhotoStorageProvider photoStorage,
        IPortraitProcessor portraitProcessor,
        ISdJwtCredentialFactory credentialFactory,
        ICredentialSigningProvider signingProvider,
        TimeProvider timeProvider
    )
    {
        _repository = repository;
        _fieldResolver = fieldResolver;
        _photoStorage = photoStorage;
        _portraitProcessor = portraitProcessor;
        _credentialFactory = credentialFactory;
        _signingProvider = signingProvider;
        _timeProvider = timeProvider;
    }

    public async Task<OfflinePackageResponseDto> GetOrMintAsync(
        Guid credentialId,
        Guid requestUserId,
        EcPublicJwk? deviceKey,
        string ipAddress,
        CancellationToken cancellationToken
    )
    {
        var credential = await _repository.GetForPackagingAsync(credentialId, cancellationToken) ?? throw new CredentialNotFoundException(credentialId);

        if (credential.Citizen.UserId != requestUserId)
        {
            throw new CredentialAccessDeniedException();
        }

        if (credential.Status != CredentialStatus.Active)
        {
            throw new CredentialNotActiveException();
        }

        var now = _timeProvider.GetUtcNow();
        var activeKey = await _signingProvider.GetActiveKeyAsync(cancellationToken);
        var deviceThumbprint = Thumbprint(deviceKey);

        if (!NeedsMinting(credential, now, activeKey.KeyId, deviceThumbprint))
        {
            return ToResponse(credential);
        }

        try
        {
            var package = await MintAsync(credential, deviceKey, deviceThumbprint, now, cancellationToken);

            // Claim NAMES only. An audit table holding claim values would be a second copy of the
            // data this feature exists to protect.
            await WriteAuditAsync(
                credential,
                requestUserId,
                ipAddress,
                AuditEventType.OfflinePackageMinted,
                $"Offline package minted. Key: {credential.SigningKid}. Revocation index: {credential.RevocationIndex}. Type: {SdJwtClaimNames.VctFor(TypeOf(credential))}. Claims: {string.Join(", ", package.Disclosures.Keys)}.",
                discardChanges: false,
                cancellationToken);

            return package;
        }
        catch (Exception exception) when (exception is OfflinePackageUnavailableException or OfflinePackageDataMissingException or OfflinePackageDocumentExpiredException)
        {
            await WriteAuditAsync(credential, requestUserId, ipAddress, AuditEventType.OfflinePackageMintFailed, exception.Message, discardChanges: true, cancellationToken);

            throw;
        }
    }

    private static CredentialType TypeOf(Credential credential) =>
        credential.IdentityDocument is not null ? CredentialType.IdentityDocument : CredentialType.DriversLicense;

    private async Task WriteAuditAsync(
        Credential credential,
        Guid actorId,
        string ipAddress,
        AuditEventType eventType,
        string details,
        bool discardChanges,
        CancellationToken cancellationToken)
    {
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = eventType,
            Details = details,
            IpAddress = ipAddress,
            ActorId = actorId,
            CredentialId = credential.Id,
            CitizenId = credential.CitizenId,
            CreatedAt = _timeProvider.GetUtcNow().UtcDateTime,
        };

        if (discardChanges)
        {
            await _repository.SaveAuditLogDiscardingChangesAsync(auditLog, cancellationToken);
            return;
        }

        await _repository.AddAuditLogAsync(auditLog, cancellationToken);
    }


    private static bool NeedsMinting(Credential credential, DateTimeOffset now, string activeKeyId, string? deviceThumbprint)
    {
        // Never minted, or minted but stored incompletely
        if (string.IsNullOrEmpty(credential.IssuerSignedCredential)
            || string.IsNullOrEmpty(credential.DisclosureSet)
            || credential.SignedAt is null
            || credential.PackageExpiresAt is null)
        {
            return true;
        }

        var updatedAt = new DateTimeOffset(DateTime.SpecifyKind(credential.UpdatedAt, DateTimeKind.Utc));

        // Every remaining rule comes from D-007
        return credential.PackageExpiresAt <= now
            || now - credential.SignedAt.Value >= RefreshAfter
            || credential.SigningKid != activeKeyId
            || credential.HolderKeyThumbprint != deviceThumbprint
            || updatedAt > credential.SignedAt.Value;
    }

    private async Task<OfflinePackageResponseDto> MintAsync(
        Credential credential,
        EcPublicJwk? deviceKey,
        string? deviceThumbprint,
        DateTimeOffset now,
        CancellationToken cancellationToken
    )
    {
        var credentialType = TypeOf(credential);
        var documentExpiry = credential.DriversLicense is { } license ? new DateTimeOffset(DateTime.SpecifyKind(license.ExpiryDate, DateTimeKind.Utc)) : (DateTimeOffset?)null;

        if (documentExpiry is not null && documentExpiry <= now)
        {
            throw new OfflinePackageDocumentExpiredException();
        }

        // Downscaling the portrait is the expensive part, so claims are built once, outside the loop.
        var claims = await BuildClaimsAsync(credential, credentialType, cancellationToken);
        var mandatoryClaims = SdJwtClaimNames.MandatoryClaimsFor(credentialType);

        for (var attempt = 1; attempt <= MaxMintAttempts; attempt++)
        {
            // Only an index allocated in this call may be released. One that came from the database
            // belongs to packages already in circulation, and changing it would leave those packages
            // pointing at a revocation index that is no longer theirs.
            var allocatedHere = credential.RevocationIndex is null;
            credential.RevocationIndex ??= await _repository.NextRevocationIndexAsync(cancellationToken);

            // The index is signed into the credential as `ri`, so a new index means signing again.
            var signed = await _credentialFactory.CreateAsync(
                new SdJwtCredentialRequest
                {
                    Vct = SdJwtClaimNames.VctFor(credentialType),
                    Claims = claims,
                    MandatoryClaimNames = mandatoryClaims,
                    RevocationIndex = credential.RevocationIndex.Value,
                    DocumentExpiresAt = documentExpiry,
                    DeviceKey = deviceKey,
                },
                cancellationToken
            );

            credential.IssuerSignedCredential = signed.IssuerJwt;
            credential.DisclosureSet = JsonSerializer.Serialize(signed.Disclosures);
            credential.SigningKid = signed.KeyId;
            credential.HolderKeyThumbprint = deviceThumbprint;
            credential.SignedAt = signed.IssuedAt;
            credential.PackageExpiresAt = signed.ExpiresAt;

            if (await _repository.TrySaveMintedPackageAsync(cancellationToken))
            {
                return ToResponse(credential);
            }

            // A credential that already had an index cannot lose a race for it, so this is not the
            // collision the retry exists for.
            if (!allocatedHere)
            {
                throw new OfflinePackageUnavailableException("the package could not be saved");
            }

            // Another mint claimed this index and nothing was written. Release it and try again.
            credential.RevocationIndex = null;

            await Task.Delay(Random.Shared.Next(MinRetryDelayMs, MaxRetryDelayMs), cancellationToken);
        }

        throw new OfflinePackageUnavailableException("a revocation index could not be allocated");
    }

    private async Task<Dictionary<string, string>> BuildClaimsAsync(
        Credential credential,
        CredentialType credentialType,
        CancellationToken cancellationToken
    )
    {
        var claims = new Dictionary<string, string>(StringComparer.Ordinal);
        var mandatory = new HashSet<string>(SdJwtClaimNames.MandatoryClaimsFor(credentialType), StringComparer.Ordinal);

        foreach (var (label, claimName) in SdJwtClaimNames.LabelToClaimFor(credentialType))
        {
            // D-011: the handwritten signature image never travels offline.
            if (!SdJwtClaimNames.IsIncludedOffline(claimName))
            {
                continue;
            }

            var source = _fieldResolver.Describe(credential, label);
            var value = source.Kind == DisclosedFieldKind.Photo ? await PortraitClaimAsync(claimName, source.Value, cancellationToken) : source.Value;

            if (string.IsNullOrEmpty(value))
            {
                // A mandatory claim with no value would be rejected by every verifier at step 8
                if (mandatory.Contains(claimName))
                {
                    throw new OfflinePackageDataMissingException(claimName);
                }

                // An optional field the citizen has no data for is left out, which saves QR frames.
                continue;
            }

            claims[claimName] = value;
        }

        return claims;
    }

    private async Task<string> PortraitClaimAsync(string claimName, string blobName, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(blobName))
        {
            return string.Empty;
        }

        Stream? photo;

        try
        {
            photo = await _photoStorage.OpenReadAsync(blobName, cancellationToken);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            // Storage being unreachable is transient, so the wallet retries rather than being told
            // its credential is incomplete.
            throw new OfflinePackageUnavailableException($"the stored photo for '{claimName}' could not be read", exception);
        }

        if (photo is null)
        {
            return string.Empty;
        }

        await using (photo)
        {
            try
            {
                var portrait = await _portraitProcessor.ToOfflinePortraitAsync(photo, cancellationToken);

                return Base64Url.EncodeToString(portrait);
            }
            catch (Exception exception) when (exception is not OperationCanceledException)
            {
                // A stored photo that will not decode will never decode, so this is 409 rather than a
                // retry, and naming the claim makes the audit row worth reading.
                throw new OfflinePackageDataMissingException(claimName, exception);
            }
        }
    }

    // RFC 7638 JWK thumbprint: SHA-256 over the required members only, in lexicographic order, no whitespace.
    // Stored instead of the key itself so a new phone is detected by comparing 43 characters.
    private static string? Thumbprint(EcPublicJwk? jwk)
    {
        if (jwk is null)
        {
            return null;
        }

        var canonical = $"{{\"crv\":\"{jwk.Crv}\",\"kty\":\"{jwk.Kty}\",\"x\":\"{jwk.X}\",\"y\":\"{jwk.Y}\"}}";

        return Base64Url.EncodeToString(SHA256.HashData(Encoding.UTF8.GetBytes(canonical)));
    }

    private static OfflinePackageResponseDto ToResponse(Credential credential) => new(
        credential.IssuerSignedCredential!,
        JsonSerializer.Deserialize<Dictionary<string, string>>(credential.DisclosureSet!)!,
        credential.SignedAt!.Value,
        credential.PackageExpiresAt!.Value
    );

    public async Task<IssuerKeysResponseDto> GetIssuerKeysAsync(CancellationToken cancellationToken)
    {
        var activeKey = await _signingProvider.GetActiveKeyAsync(cancellationToken);
        var jwk = activeKey.PublicJwk;

        // Only the active key for now. Retired keys join this list when the rolling-keys SigningKeys
        // table lands (checklist 1.23); packages last 30 days, so a retired key stays published for about 45.
        return new IssuerKeysResponseDto(
            [new IssuerKeyDto(jwk.Kid, jwk.Kty, jwk.Crv, jwk.X, jwk.Y, "active")],
            _timeProvider.GetUtcNow());
    }

    public async Task<RevocationListResponseDto> GetRevocationListAsync(CancellationToken cancellationToken)
    {
        var signingKey = await _signingProvider.GetActiveKeyAsync(cancellationToken);
        var revokedIndexes = await _repository.GetRevokedIndexesAsync(cancellationToken);
        var now = _timeProvider.GetUtcNow();

        var header = new JsonObject
        {
            ["alg"] = signingKey.Algorithm,
            ["typ"] = RevocationListType,
            ["kid"] = signingKey.KeyId,
        };
        var payload = new JsonObject
        {
            ["iss"] = Issuer,
            ["iat"] = now.ToUnixTimeSeconds(),
            ["next_update"] = now.Add(RevocationListLifetime).ToUnixTimeSeconds(),
            ["revoked"] = new JsonArray(revokedIndexes.Select(index => (JsonNode?)JsonValue.Create(index)).ToArray()),
        };

        // Signed with the credential key, so a verifier checks it against the same cached key set as the credentials.
        var signingInput = $"{EncodeJson(header)}.{EncodeJson(payload)}";
        var signature = await _signingProvider.SignAsync(signingKey.KeyId, Encoding.ASCII.GetBytes(signingInput), cancellationToken);

        return new RevocationListResponseDto($"{signingInput}.{Base64Url.EncodeToString(signature)}", now);
    }

    public async Task<OfflineVerificationSyncResultDto> RecordOfflineVerificationsAsync(
        Guid verifierUserId,
        IReadOnlyList<OfflineVerificationEntryDto> entries,
        string ipAddress,
        CancellationToken cancellationToken
    )
    {
        ValidateOfflineVerifications(entries);

        var existing = await _repository.GetExistingAuditLogIdsAsync(entries.Select(entry => entry.Id).ToList(), cancellationToken);
        // A retried upload repeats entries already stored. The phone's id is the audit row's id, so those are skipped.
        var fresh = entries.Where(entry => !existing.Contains(entry.Id)).DistinctBy(entry => entry.Id).ToList();

        var verifiedIndexes = fresh
            .Where(entry => entry.Result == VerifiedResult && entry.RevocationIndex is not null)
            .Select(entry => entry.RevocationIndex!.Value)
            .Distinct()
            .ToList();
        var credentials = await _repository.GetCredentialsByRevocationIndexAsync(verifiedIndexes, cancellationToken);
        var receivedAt = _timeProvider.GetUtcNow();

        var auditLogs = fresh.Select(entry => ToOfflineAuditLog(entry, verifierUserId, ipAddress, receivedAt, credentials)).ToList();

        if (auditLogs.Count > 0)
        {
            await _repository.AddAuditLogsAsync(auditLogs, cancellationToken);
        }

        return new OfflineVerificationSyncResultDto(auditLogs.Count, entries.Count - auditLogs.Count);
    }

    private static void ValidateOfflineVerifications(IReadOnlyList<OfflineVerificationEntryDto> entries)
    {
        if (entries.Count > MaxOfflineVerificationsPerBatch)
        {
            throw new ArgumentException($"At most {MaxOfflineVerificationsPerBatch} offline verifications can be sent at once.", nameof(entries));
        }

        foreach (var entry in entries)
        {
            if (entry.Id == Guid.Empty)
            {
                throw new ArgumentException("Every offline verification needs an id.", nameof(entries));
            }

            if (!KnownVerificationResults.Contains(entry.Result))
            {
                throw new ArgumentException($"Unknown offline verification result '{entry.Result}'.", nameof(entries));
            }

            if (entry.VerifiedAt < 0 || entry.VerifiedAt > MaxUnixSeconds)
            {
                throw new ArgumentException("An offline verification time is out of range.", nameof(entries));
            }
        }
    }

    private static AuditLog ToOfflineAuditLog(
        OfflineVerificationEntryDto entry,
        Guid verifierUserId,
        string ipAddress,
        DateTimeOffset receivedAt,
        IReadOnlyDictionary<int, Credential> credentials)
    {
        var isVerified = entry.Result == VerifiedResult;
        // Only a verified scan proved the issuer signed this revocation index. A failed one may carry a forged index, so it is
        // never linked to a citizen, which would let anyone fill a citizen's history with fake rejections.
        var credential = isVerified && entry.RevocationIndex is { } index && credentials.TryGetValue(index, out var match) ? match : null;
        var scannedAt = DateTimeOffset.FromUnixTimeSeconds(entry.VerifiedAt);
        var revocationIndex = entry.RevocationIndex?.ToString(CultureInfo.InvariantCulture) ?? "none";

        return new AuditLog
        {
            Id = entry.Id,
            EventType = isVerified ? AuditEventType.OfflineCredentialVerified : AuditEventType.OfflineVerificationRejected,
            // Both times, because the phone's clock may be wrong after days offline and only the receipt time is the server's own.
            Details = $"Offline verification. Result: {entry.Result}. Revocation index: {revocationIndex}. Scanned at {scannedAt:O} by the verifier's device clock; received at {receivedAt:O}.",
            IpAddress = ipAddress,
            ActorId = verifierUserId,
            CredentialId = credential?.Id,
            CitizenId = credential?.CitizenId,
            CreatedAt = receivedAt.UtcDateTime,
        };
    }

    private static string EncodeJson(JsonObject json) =>
        Base64Url.EncodeToString(Encoding.UTF8.GetBytes(json.ToJsonString(WireJsonOptions)));
}