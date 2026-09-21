using System.Security.Cryptography;
using System.Text;
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
    private readonly IQrSigningProvider _qrSigningProvider;
    private readonly IEmergencyNotifier _notifier;
    private readonly IFieldCryptoProvider _fieldCrypto;

    public EmergencyService(
        IEmergencyRepository repository,
        ICredentialRepository credentialRepository,
        IInstitutionRepository auditRepository,
        IPhotoStorageProvider photoStorage,
        IQrSigningProvider qrSigningProvider,
        IEmergencyNotifier notifier,
        IFieldCryptoProvider fieldCrypto)
    {
        _repository = repository;
        _credentialRepository = credentialRepository;
        _auditRepository = auditRepository;
        _photoStorage = photoStorage;
        _qrSigningProvider = qrSigningProvider;
        _notifier = notifier;
        _fieldCrypto = fieldCrypto;
    }

    public async Task<EmergencyProfileResponseDto> ResolveAsync(
        ResolveEmergencyRequestDto request, Guid responderUserId, string ipAddress, CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;

        var responder = await _repository.GetResponderAsync(responderUserId, ct)
            ?? throw await FailAsync(responderUserId, ipAddress,
                "Official is not attached to a healthcare or law-enforcement institution.", ct);

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
            ResponderInstitutionName = responder?.Institution?.Name,
            InstitutionId = responder?.InstitutionId,
            Justification = request.Justification,
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
            Details = $"Break-glass emergency access. Justification: {request.Justification}",
            IpAddress = ipAddress,
            CreatedAt = now.UtcDateTime,
        });
        await _repository.SaveChangesAsync(ct);

        _ = _notifier.NotifyEmergencyAccessAsync(access.Id, CancellationToken.None);

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

        var publicKey = EmergencyBase64Url.Decode(request.PublicKeySpki);

        try
        {
            using var probe = ECDsa.Create();
            probe.ImportSubjectPublicKeyInfo(publicKey, out _);
        }
        catch (CryptographicException)
        {
            throw new InvalidEmergencyCodeException("Device public key is not a valid SubjectPublicKeyInfo.");
        }

        var existing = await _repository.GetActiveDeviceByCitizenIdAsync(citizen.Id, ct);
        if (existing is not null)
        {
            existing.RevokedAt = DateTime.UtcNow;
            existing.UpdatedAt = DateTime.UtcNow;
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

        profile.IsEnabled = request.IsEnabled;
        profile.ConsentGivenAt = request.ConsentGiven ? profile.ConsentGivenAt ?? now : null;
        profile.OfflineFieldsJson = JsonSerializer.Serialize(request.OfflineFields, CamelCase);
        profile.MedicalLastUpdatedAt = now;
        profile.UpdatedAt = now;

        WriteMedicalFields(profile, request.Fields);

        profile.Contacts.Clear();
        foreach (var contact in request.Contacts)
        {
            profile.Contacts.Add(new EmergencyContact
            {
                Id = Guid.NewGuid(),
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

        var released = JsonSerializer.Deserialize<HashSet<string>>(profile.OfflineFieldsJson, CamelCase) ?? [];
        var claims = ReadMedicalFields(profile)
            .Where(f => released.Contains(f.Key))
            .ToDictionary(f => f.Key, f => f.Value);

        if (released.Contains("name"))
            claims["name"] = $"{profile.Citizen.Names} {profile.Citizen.Surname}";

        var issuedAt = DateTimeOffset.UtcNow;
        var expiresAt = issuedAt.AddDays(90);

        var payload = new
        {
            v = 1,
            typ = "emergency-offline",
            hdl = EmergencyBase64Url.Encode(device.Handle),
            iat = issuedAt.ToUnixTimeSeconds(),
            exp = expiresAt.ToUnixTimeSeconds(),
            upd = profile.MedicalLastUpdatedAt?.ToString("yyyy-MM-dd"),
            src = "self-reported",
            claims,
        };

        var json = JsonSerializer.Serialize(payload, CamelCase);

        return new OfflineCredentialResponseDto
        {
            Payload = EmergencyBase64Url.Encode(Encoding.UTF8.GetBytes(json)),
            Signature = _qrSigningProvider.Sign(json),
            ExpiresAt = expiresAt.UtcDateTime,
        };
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
        await _repository.SaveChangesAsync(ct);

        return new InvalidEmergencyCodeException(reason);
    }

    private List<EmergencyMedicalFieldDto> ReadMedicalFields(EmergencyProfile profile) =>
        MedicalFields
            .Select(f => (f.Key, f.Label, Cipher: CipherFor(profile, f.Key)))
            .Where(f => !string.IsNullOrWhiteSpace(f.Cipher))
            .Select(f => new EmergencyMedicalFieldDto
            {
                Key = f.Key,
                Label = f.Label,
                Value = _fieldCrypto.Decrypt(f.Cipher!),
            })
            .ToList();

    private void WriteMedicalFields(EmergencyProfile profile, Dictionary<string, string> fields)
    {
        string? Encrypt(string key) =>
            fields.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value)
                ? _fieldCrypto.Encrypt(value)
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
