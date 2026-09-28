using System.Buffers.Text;
using System.Globalization;
using System.Security.Cryptography;
using System.Text.Json;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Emergency.DTOs;
using Application.Features.Emergency.Exceptions;
using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Services;

public class EmergencyService : IEmergencyService
{
    private const int MaxMintAttempts = 4;
    private const int MinJustificationLength = 10;
    private const int MaxJustificationLength = 500;
    private static readonly TimeSpan MaxOfflineClockAhead = TimeSpan.FromDays(1);
    private static readonly TimeSpan KeyBindingClockSkew = TimeSpan.FromMinutes(1);
    private static readonly TimeSpan MaxOfflineConfirmDelay = TimeSpan.FromMinutes(30);

    private static readonly HashSet<string> P256CurveNames =
        new(StringComparer.OrdinalIgnoreCase) { "nistP256", "secp256r1", "prime256v1", "ECDSA_P256" };

    private static readonly JsonSerializerOptions CamelCase = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private static readonly (string Key, string Label)[] MedicalFields =
    [
        ("allergies", "Severe allergies"),
        ("medication", "Blood thinners & chronic medication"),
        ("implants", "Implanted devices"),
        ("conditions", "Medical conditions"),
        ("bloodType", "Blood type"),
        ("communication", "Communication needs"),
        ("medicalAidScheme", "Medical aid scheme"),
        ("medicalAidNumber", "Medical aid number"),
    ];

    private readonly IEmergencyRepository _repository;
    private readonly ICredentialRepository _credentialRepository;
    private readonly IInstitutionRepository _auditRepository;
    private readonly IPhotoStorageProvider _photoStorage;
    private readonly ISdJwtCredentialFactory _credentialFactory;
    private readonly ICredentialSigningProvider _signingProvider;
    private readonly IEmergencyNotificationQueue _notificationQueue;
    private readonly IFieldCryptoProvider _fieldCrypto;

    public EmergencyService(
        IEmergencyRepository repository,
        ICredentialRepository credentialRepository,
        IInstitutionRepository auditRepository,
        IPhotoStorageProvider photoStorage,
        ISdJwtCredentialFactory credentialFactory,
        ICredentialSigningProvider signingProvider,
        IEmergencyNotificationQueue notificationQueue,
        IFieldCryptoProvider fieldCrypto)
    {
        _repository = repository;
        _credentialRepository = credentialRepository;
        _auditRepository = auditRepository;
        _photoStorage = photoStorage;
        _credentialFactory = credentialFactory;
        _signingProvider = signingProvider;
        _notificationQueue = notificationQueue;
        _fieldCrypto = fieldCrypto;
    }

    public async Task<EmergencyProfileResponseDto> ResolveAsync(
        ResolveEmergencyRequestDto request, Guid responderUserId, string ipAddress, CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;

        var responder = await _repository.GetResponderAsync(responderUserId, ct)
            ?? throw await FailAsync(responderUserId, ipAddress,
                "Official is not attached to a healthcare or law-enforcement institution.", ct);

        var justification = RequireJustification(request.Justification);

        if (!EmergencyCodeVerifier.TryParse(request.Code, out var code))
            throw await FailAsync(responderUserId, ipAddress, "Malformed emergency code.", ct);

        if (!EmergencyCodeVerifier.IsFresh(code, now))
            throw await FailAsync(responderUserId, ipAddress, "Emergency code expired.", ct);

        var device = await _repository.GetActiveDeviceByHandleAsync(code.Handle, ct);
        if (device is null)
            throw await FailAsync(responderUserId, ipAddress, "Unknown emergency handle.", ct);

        if (!EmergencyCodeVerifier.VerifySignature(code, device.PublicKeySpki))
            throw await FailAsync(responderUserId, ipAddress, "Emergency code signature invalid.", ct);

        if (!await _repository.TryClaimCodeAsync(code.Handle, code.IssuedAt, ct))
            throw await FailAsync(responderUserId, ipAddress, "Emergency code already used.", ct);

        var profile = await _repository.GetEnabledProfileWithContactsAsync(device.CitizenId, ct)
            ?? throw new EmergencyProfileNotFoundException();

        var credentials = await _credentialRepository.GetCredentialsByCitizenIdAsync(device.CitizenId);
        var identityDocument = credentials
            .FirstOrDefault(c => c.Status == CredentialStatus.Active && c.IdentityDocument != null);

        var photoPath = identityDocument?.IdentityDocument?.PhotoPath;
        var photoUrl = string.IsNullOrWhiteSpace(photoPath)
            ? null
            : await _photoStorage.GenerateReadSasUrlAsync(photoPath, TimeSpan.FromMinutes(15));

        var access = new EmergencyAccess
        {
            Id = Guid.NewGuid(),
            EmergencyProfileId = profile.Id,
            ResponderUserId = responderUserId,
            ResponderName = $"{responder.Names} {responder.Surname}",
            ResponderInstitutionName = responder.Institution?.Name,
            InstitutionId = responder.InstitutionId,
            Justification = justification,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            IpAddress = ipAddress,
            WasOffline = request.WasOffline,
            AccessedAt = now.UtcDateTime,
            CreatedAt = now.UtcDateTime,
            UpdatedAt = now.UtcDateTime,
        };
        await _repository.AddAccessAsync(access, ct);

        await _auditRepository.AddAuditLogAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            ActorId = responderUserId,
            CitizenId = profile.CitizenId,
            EventType = AuditEventType.EmergencyProfileAccessed,
            Details = $"Break-glass emergency access. Justification: {justification}",
            IpAddress = ipAddress,
            CreatedAt = now.UtcDateTime,
        });
        await _repository.SaveChangesAsync(ct);

        _notificationQueue.Enqueue(access.Id);

        return new EmergencyProfileResponseDto
        {
            Identity = new EmergencyIdentityDto
            {
                Names = profile.Citizen.Names,
                Surname = profile.Citizen.Surname,
                DateOfBirth = profile.Citizen.DateOfBirth,
                PhotoUrl = photoUrl,
            },
            Medical = ReadMedicalFields(profile),
            Contacts = profile.Contacts.OrderBy(c => c.Priority).Select(ToContactDto).ToList(),
            MedicalLastUpdatedAt = profile.MedicalLastUpdatedAt,
            AccessedAt = access.AccessedAt,
        };
    }

    public async Task<RegisterEmergencyDeviceResponseDto> RegisterDeviceAsync(
        RegisterEmergencyDeviceRequestDto request, Guid userId, CancellationToken ct)
    {
        var citizen = await _credentialRepository.GetCitizenByUserIdAsync(userId)
            ?? throw new EmergencyProfileNotFoundException();

        byte[] publicKey;
        try
        {
            publicKey = EmergencyBase64Url.Decode(request.PublicKeySpki ?? string.Empty);

            using var probe = ECDsa.Create();
            probe.ImportSubjectPublicKeyInfo(publicKey, out _);

            if (!IsP256(probe.ExportParameters(false).Curve))
            {
                throw new InvalidEmergencyCodeException("Device public key must be P-256.");
            }
        }
        catch (Exception ex) when (ex is CryptographicException or FormatException)
        {
            throw new InvalidEmergencyCodeException("Device public key is not a valid SubjectPublicKeyInfo.");
        }

        var existing = await _repository.GetActiveDeviceByCitizenIdAsync(citizen.Id, ct);
        if (existing is not null)
        {
            existing.RevokedAt = DateTime.UtcNow;
            existing.UpdatedAt = DateTime.UtcNow;
        }

        var profile = await _repository.GetProfileByUserIdAsync(userId, ct);
        if (profile is not null)
        {
            await RetireRevocationIndexAsync(profile, ct);
        }

        var handle = RandomNumberGenerator.GetBytes(16);
        var now = DateTime.UtcNow;

        await _repository.AddDeviceAsync(new EmergencyDevice
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Handle = handle,
            PublicKeySpki = publicKey,
            Platform = request.Platform,
            DeviceLabel = request.DeviceLabel,
            IsStrongBoxBacked = request.IsStrongBoxBacked,
            CreatedAt = now,
            UpdatedAt = now,
        }, ct);

        await _auditRepository.AddAuditLogAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            ActorId = userId,
            CitizenId = citizen.Id,
            EventType = AuditEventType.EmergencyDeviceRegistered,
            Details = $"Emergency device registered ({request.Platform}, StrongBox: {request.IsStrongBoxBacked}).",
            CreatedAt = now,
        });
        await _repository.SaveChangesAsync(ct);

        return new RegisterEmergencyDeviceResponseDto { Handle = EmergencyBase64Url.Encode(handle) };
    }

    public async Task<EmergencyProfileDto> GetMyProfileAsync(Guid userId, CancellationToken ct)
    {
        var profile = await _repository.GetProfileByUserIdAsync(userId, ct);
        if (profile is null)
        {
            return new EmergencyProfileDto();
        }

        return ToProfileDto(profile);
    }

    public async Task<EmergencyProfileDto> SaveProfileAsync(
        SaveEmergencyProfileRequestDto request, Guid userId, CancellationToken ct)
    {
        if (request.IsEnabled && !request.ConsentGiven)
            throw new EmergencyConsentRequiredException();

        var now = DateTime.UtcNow;
        var profile = await _repository.GetProfileByUserIdAsync(userId, ct);

        if (profile is null)
        {
            var citizen = await _credentialRepository.GetCitizenByUserIdAsync(userId)
                ?? throw new EmergencyProfileNotFoundException();

            profile = new EmergencyProfile
            {
                Id = Guid.NewGuid(),
                CitizenId = citizen.Id,
                CreatedAt = now,
            };
            await _repository.AddProfileAsync(profile, ct);
        }

        var releasedBefore = profile.RevocationIndex is null ? null : ReleasedOfflineClaims(profile);
        var medicalBefore = MedicalValues(profile);

        profile.IsEnabled = request.IsEnabled;
        profile.ConsentGivenAt = request.ConsentGiven ? profile.ConsentGivenAt ?? now : null;
        profile.OfflineFieldsJson = JsonSerializer.Serialize(request.OfflineFields, CamelCase);
        profile.UpdatedAt = now;

        WriteMedicalFields(profile, request.Fields);

        profile.Contacts.Clear();
        foreach (var contact in request.Contacts)
        {
            profile.Contacts.Add(new EmergencyContact
            {
                EmergencyProfileId = profile.Id,
                Name = contact.Name,
                Relationship = contact.Relationship,
                Email = contact.Email,
                Phone = contact.Phone,
                Priority = contact.Priority,
                CreatedAt = now,
                UpdatedAt = now,
            });
        }

        if (profile.MedicalLastUpdatedAt is null || !SameValues(medicalBefore, MedicalValues(profile)))
        {
            profile.MedicalLastUpdatedAt = now;
        }

        if (!profile.IsEnabled || (releasedBefore is not null && !SameValues(releasedBefore, ReleasedOfflineClaims(profile))))
        {
            await RetireRevocationIndexAsync(profile, ct);
        }

        await _auditRepository.AddAuditLogAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            ActorId = userId,
            CitizenId = profile.CitizenId,
            EventType = request.ConsentGiven && profile.ConsentGivenAt == now
                ? AuditEventType.EmergencyConsentRecorded
                : AuditEventType.EmergencyProfileUpdated,
            Details = $"Emergency profile saved. Enabled: {request.IsEnabled}, "
                    + $"offline fields: {request.OfflineFields.Count}.",
            CreatedAt = now,
        });
        await _repository.SaveChangesAsync(ct);

        return ToProfileDto(profile);
    }

    public async Task<OfflineCredentialResponseDto> BuildOfflineCredentialAsync(Guid userId, CancellationToken ct)
    {
        var profile = await _repository.GetProfileByUserIdAsync(userId, ct)
            ?? throw new EmergencyProfileNotFoundException();

        if (!profile.IsEnabled || profile.ConsentGivenAt is null)
            throw new EmergencyProfileNotFoundException();

        var device = await _repository.GetActiveDeviceByCitizenIdAsync(profile.CitizenId, ct)
            ?? throw new EmergencyDeviceNotRegisteredException();

        var claims = BuildOfflineClaims(profile);
        var deviceKey = DeviceKeyFor(device);

        for (var attempt = 1; attempt <= MaxMintAttempts; attempt++)
        {
            var allocatedHere = profile.RevocationIndex is null;
            profile.RevocationIndex ??= await _repository.NextRevocationIndexAsync(ct);

            var signed = await _credentialFactory.CreateAsync(new SdJwtCredentialRequest
            {
                Vct = EmergencyClaimNames.Vct,
                Claims = claims,
                MandatoryClaimNames = EmergencyClaimNames.MandatoryClaims,
                RevocationIndex = profile.RevocationIndex.Value,
                DeviceKey = deviceKey,
            }, ct);

            if (!allocatedHere || await _repository.TrySaveChangesAsync(ct))
            {
                return new OfflineCredentialResponseDto
                {
                    SdJwt = signed.ToSdJwt(),
                    ExpiresAt = signed.ExpiresAt.UtcDateTime,
                };
            }

            profile.RevocationIndex = null;
        }

        throw new InvalidOperationException("An emergency revocation index could not be allocated.");
    }

    public async Task RecordOfflineAccessAsync(
        RecordOfflineEmergencyAccessRequestDto request, Guid responderUserId, string ipAddress, CancellationToken ct)
    {
        var justification = RequireJustification(request.Justification);
        if (request.Id == Guid.Empty)
        {
            throw new ArgumentException("An offline emergency access needs an id.", nameof(request));
        }

        var now = DateTimeOffset.UtcNow;
        if (request.AccessedAt > now.Add(MaxOfflineClockAhead).ToUnixTimeSeconds() || request.AccessedAt <= 0)
        {
            throw new ArgumentException("The offline access time is not plausible.", nameof(request));
        }

        if (await _repository.AccessExistsAsync(request.Id, ct))
        {
            return;
        }

        var issuerKey = await _signingProvider.GetActiveKeyAsync(ct);
        var scanned = EmergencyPresentationVerifier.Verify(request.Presentation, issuerKey);
        if (scanned is null || scanned.RevocationIndex != request.RevocationIndex)
        {
            throw new ArgumentException("The scanned emergency code could not be verified.", nameof(request));
        }

        var accessedAt = DateTimeOffset.FromUnixTimeSeconds(request.AccessedAt);
        if (scanned.KeyBoundAt > now.Add(KeyBindingClockSkew)
            || accessedAt < scanned.KeyBoundAt.Subtract(KeyBindingClockSkew)
            || accessedAt > scanned.KeyBoundAt.Add(MaxOfflineConfirmDelay))
        {
            throw new ArgumentException("The offline access time does not match when the code was scanned.", nameof(request));
        }

        var profile = await _repository.GetProfileByRevocationIndexAsync(scanned.RevocationIndex, ct)
            ?? throw new EmergencyProfileNotFoundException();

        if (await _repository.OfflineAccessExistsAsync(
                profile.Id,
                responderUserId,
                scanned.KeyBoundAt.Subtract(KeyBindingClockSkew).UtcDateTime,
                scanned.KeyBoundAt.Add(MaxOfflineConfirmDelay).UtcDateTime,
                ct))
        {
            return;
        }

        var official = await _repository.GetOfficialAsync(responderUserId, ct);
        var authorised = official?.Institution?.Type is InstitutionType.Healthcare or InstitutionType.LawEnforcement;

        var access = new EmergencyAccess
        {
            Id = request.Id,
            EmergencyProfileId = profile.Id,
            ResponderUserId = responderUserId,
            ResponderName = official is null ? "Unknown official" : $"{official.Names} {official.Surname}",
            ResponderInstitutionName = official?.Institution?.Name,
            InstitutionId = official?.InstitutionId,
            Justification = justification,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            IpAddress = ipAddress,
            WasOffline = true,
            AccessedAt = accessedAt.UtcDateTime,
            CreatedAt = now.UtcDateTime,
            UpdatedAt = now.UtcDateTime,
        };
        await _repository.AddAccessAsync(access, ct);

        await _auditRepository.AddAuditLogAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            ActorId = responderUserId,
            CitizenId = profile.CitizenId,
            EventType = AuditEventType.EmergencyProfileAccessed,
            Details = authorised
                ? $"Offline break-glass access, uploaded on reconnect. Justification: {justification}"
                : $"Offline break-glass access by an official outside healthcare and law enforcement, uploaded on reconnect. Justification: {justification}",
            IpAddress = ipAddress,
            CreatedAt = now.UtcDateTime,
        });

        if (!await _repository.TrySaveChangesAsync(CancellationToken.None))
        {
            return;
        }

        _notificationQueue.Enqueue(access.Id);
    }

    private static string RequireJustification(string? justification)
    {
        var trimmed = justification?.Trim() ?? string.Empty;
        if (trimmed.Length < MinJustificationLength || trimmed.Length > MaxJustificationLength)
        {
            throw new ArgumentException(
                $"Give a reason of {MinJustificationLength} to {MaxJustificationLength} characters.",
                nameof(justification));
        }

        return trimmed;
    }

    private static bool IsP256(ECCurve curve) =>
        curve.IsNamed
        && (curve.Oid?.Value == ECCurve.NamedCurves.nistP256.Oid.Value
            || (curve.Oid?.FriendlyName is { } name && P256CurveNames.Contains(name)));

    private Dictionary<string, string> BuildOfflineClaims(EmergencyProfile profile)
    {
        var claims = ReleasedOfflineClaims(profile);

        var updatedOn = profile.MedicalLastUpdatedAt ?? profile.ConsentGivenAt ?? profile.UpdatedAt;
        claims[EmergencyClaimNames.MedicalUpdatedOn] = updatedOn.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

        return claims;
    }

    private Dictionary<string, string> ReleasedOfflineClaims(EmergencyProfile profile)
    {
        var released = JsonSerializer.Deserialize<HashSet<string>>(profile.OfflineFieldsJson, CamelCase) ?? [];
        var claims = new Dictionary<string, string>(StringComparer.Ordinal);

        foreach (var field in ReadMedicalFields(profile).Where(f => released.Contains(f.Key)))
        {
            if (EmergencyClaimNames.ClaimNameFor(field.Key) is { } claimName && !string.IsNullOrWhiteSpace(field.Value))
            {
                claims[claimName] = field.Value;
            }
        }

        var fullName = $"{profile.Citizen?.Names} {profile.Citizen?.Surname}".Trim();
        if (released.Contains(EmergencyClaimNames.NameField) && fullName.Length > 0)
        {
            claims[EmergencyClaimNames.FullName] = fullName;
        }

        if (released.Contains(EmergencyClaimNames.ContactsField))
        {
            var position = 1;
            foreach (var contact in profile.Contacts.OrderBy(c => c.Priority).Take(EmergencyClaimNames.MaxOfflineContacts))
            {
                if (string.IsNullOrWhiteSpace(contact.Name))
                {
                    continue;
                }

                claims[EmergencyClaimNames.ContactClaim(position, "name")] = contact.Name;
                if (!string.IsNullOrWhiteSpace(contact.Relationship))
                {
                    claims[EmergencyClaimNames.ContactClaim(position, "relationship")] = contact.Relationship;
                }
                if (!string.IsNullOrWhiteSpace(contact.Phone))
                {
                    claims[EmergencyClaimNames.ContactClaim(position, "phone")] = contact.Phone;
                }
                position++;
            }
        }

        return claims;
    }

    private Dictionary<string, string> MedicalValues(EmergencyProfile profile) =>
        ReadMedicalFields(profile).ToDictionary(f => f.Key, f => f.Value, StringComparer.Ordinal);

    private static bool SameValues(IReadOnlyDictionary<string, string> before, IReadOnlyDictionary<string, string> after) =>
        before.Count == after.Count
        && before.All(entry => after.TryGetValue(entry.Key, out var value) && value == entry.Value);

    private static EcPublicJwk DeviceKeyFor(EmergencyDevice device)
    {
        using var key = ECDsa.Create();
        key.ImportSubjectPublicKeyInfo(device.PublicKeySpki, out _);
        var point = key.ExportParameters(includePrivateParameters: false).Q;

        return new EcPublicJwk(
            "EC",
            "P-256",
            device.Id.ToString(),
            Base64Url.EncodeToString(point.X!),
            Base64Url.EncodeToString(point.Y!));
    }

    private async Task RetireRevocationIndexAsync(EmergencyProfile profile, CancellationToken ct)
    {
        if (profile.RevocationIndex is not int index)
        {
            return;
        }

        await _repository.AddRetiredRevocationIndexAsync(new RetiredEmergencyRevocationIndex
        {
            Id = Guid.NewGuid(),
            RevocationIndex = index,
            EmergencyProfileId = profile.Id,
            RetiredAt = DateTime.UtcNow,
        }, ct);

        profile.RevocationIndex = null;
    }

    public async Task<List<EmergencyAccessDto>> GetMyAccessHistoryAsync(Guid userId, CancellationToken ct)
    {
        var accesses = await _repository.GetAccessHistoryByUserIdAsync(userId, ct);

        return accesses.Select(a => new EmergencyAccessDto
        {
            AccessedAt = a.AccessedAt,
            ResponderName = a.ResponderName,
            InstitutionName = a.ResponderInstitutionName,
            Justification = a.Justification,
            Latitude = a.Latitude,
            Longitude = a.Longitude,
            WasOffline = a.WasOffline,
        }).ToList();
    }

    private async Task<InvalidEmergencyCodeException> FailAsync(
        Guid responderUserId, string ipAddress, string reason, CancellationToken ct)
    {
        await _auditRepository.AddAuditLogAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            ActorId = responderUserId,
            EventType = AuditEventType.EmergencyProfileAccessFailed,
            Details = $"Emergency access rejected: {reason}",
            IpAddress = ipAddress,
            CreatedAt = DateTime.UtcNow,
        });
        await _repository.SaveChangesAsync(CancellationToken.None);

        return new InvalidEmergencyCodeException(reason);
    }

    private static string FieldContext(EmergencyProfile profile, string fieldKey) => $"{profile.Id:N}/{fieldKey}";

    private List<EmergencyMedicalFieldDto> ReadMedicalFields(EmergencyProfile profile) =>
        MedicalFields
            .Select(f => (f.Key, f.Label, Cipher: CipherFor(profile, f.Key)))
            .Where(f => !string.IsNullOrWhiteSpace(f.Cipher))
            .Select(f => new EmergencyMedicalFieldDto
            {
                Key = f.Key,
                Label = f.Label,
                Value = _fieldCrypto.Decrypt(f.Cipher!, FieldContext(profile, f.Key)),
            })
            .ToList();

    private void WriteMedicalFields(EmergencyProfile profile, Dictionary<string, string> fields)
    {
        string? Encrypt(string key) =>
            fields.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value)
                ? _fieldCrypto.Encrypt(value, FieldContext(profile, key))
                : null;

        profile.AllergiesCipher = Encrypt("allergies");
        profile.MedicationCipher = Encrypt("medication");
        profile.ImplantsCipher = Encrypt("implants");
        profile.ConditionsCipher = Encrypt("conditions");
        profile.BloodTypeCipher = Encrypt("bloodType");
        profile.CommunicationNeedsCipher = Encrypt("communication");
        profile.MedicalAidSchemeCipher = Encrypt("medicalAidScheme");
        profile.MedicalAidNumberCipher = Encrypt("medicalAidNumber");
    }

    private static string? CipherFor(EmergencyProfile profile, string key) => key switch
    {
        "allergies" => profile.AllergiesCipher,
        "medication" => profile.MedicationCipher,
        "implants" => profile.ImplantsCipher,
        "conditions" => profile.ConditionsCipher,
        "bloodType" => profile.BloodTypeCipher,
        "communication" => profile.CommunicationNeedsCipher,
        "medicalAidScheme" => profile.MedicalAidSchemeCipher,
        "medicalAidNumber" => profile.MedicalAidNumberCipher,
        _ => null,
    };

    private EmergencyProfileDto ToProfileDto(EmergencyProfile profile) => new()
    {
        IsEnabled = profile.IsEnabled,
        ConsentGivenAt = profile.ConsentGivenAt,
        Fields = ReadMedicalFields(profile).ToDictionary(f => f.Key, f => f.Value),
        OfflineFields = JsonSerializer.Deserialize<List<string>>(profile.OfflineFieldsJson, CamelCase) ?? [],
        Contacts = profile.Contacts.OrderBy(c => c.Priority).Select(ToContactDto).ToList(),
        MedicalLastUpdatedAt = profile.MedicalLastUpdatedAt,
    };

    private static EmergencyContactDto ToContactDto(EmergencyContact contact) => new()
    {
        Name = contact.Name,
        Relationship = contact.Relationship,
        Email = contact.Email,
        Phone = contact.Phone,
        Priority = contact.Priority,
    };
}
