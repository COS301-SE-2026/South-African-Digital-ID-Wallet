using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
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

        // return NeedsMinting(credential, now, activeKey.KeyId, deviceThumbprint) ? await MintAsync(credential, deviceKey, deviceThumbprint, now, cancellationToken) : ToResponse(credential);
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
        catch (Exception exception) when (exception is OfflinePackageUnavailableException or OfflinePackageDataMissingException)
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
            throw new OfflinePackageUnavailableException("the document has already expired");
        }

        // Downscaling the portrait is the expensive part, so claims are built once, outside the loop.
        var claims = await BuildClaimsAsync(credential, credentialType, cancellationToken);
        var mandatoryClaims = SdJwtClaimNames.MandatoryClaimsFor(credentialType);

        for (var attempt = 1; attempt <= MaxMintAttempts; attempt++)
        {
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
            var value = source.Kind == DisclosedFieldKind.Photo ? await PortraitClaimAsync(source.Value, cancellationToken) : source.Value;

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

    private async Task<string> PortraitClaimAsync(string blobName, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(blobName))
        {
            return string.Empty;
        }

        await using var photo = await _photoStorage.OpenReadAsync(blobName, cancellationToken);

        if (photo is null)
        {
            return string.Empty;
        }

        var portrait = await _portraitProcessor.ToOfflinePortraitAsync(photo, cancellationToken);

        return Base64Url.EncodeToString(portrait);
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
}