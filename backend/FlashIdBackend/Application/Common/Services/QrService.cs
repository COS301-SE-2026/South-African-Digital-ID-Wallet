using System.Text;
using System.Text.Json;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Credentials;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Enums;
using Application.Features.Credentials.Exceptions;
using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Services;

public class QrService : IQrService
{
    private const int QrLifetimeSeconds = 60;

    private readonly ICredentialRepository _credentialRepository;
    private readonly IQrSigningProvider _qrSigningProvider;
    private readonly IQrSignatureVerifier _qrSignatureVerifier;
    private readonly IQrDisclosureTokenRepository _qrDisclosureTokenRepository;
    private readonly IInstitutionRepository _institutionRepository;
    private readonly IDisclosedFieldsValueResolver _disclosedFieldsValueResolver;

    private static readonly JsonSerializerOptions CamelCaseOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public QrService(ICredentialRepository credentialRepository, IQrSigningProvider qrSigningProvider, IQrSignatureVerifier qrSignatureVerifier, IQrDisclosureTokenRepository qrDisclosureTokenRepository, IInstitutionRepository institutionRepository, IDisclosedFieldsValueResolver disclosedFieldsValueResolver)
    {
        _credentialRepository = credentialRepository;
        _qrSigningProvider = qrSigningProvider;
        _qrSignatureVerifier = qrSignatureVerifier;
        _qrDisclosureTokenRepository = qrDisclosureTokenRepository;
        _institutionRepository = institutionRepository;
        _disclosedFieldsValueResolver = disclosedFieldsValueResolver;
    }

    public async Task<GenerateQrResponseDto> GenerateQrAsync(Guid credentialId, Guid requestingUserId, GenerateQrRequestDto request)
    {
        var credential = await _credentialRepository.GetByIdAsync(credentialId);
        if (credential == null)
            throw new CredentialNotFoundException(credentialId);

        if (credential.Citizen.UserId != requestingUserId)
            throw new CredentialAccessDeniedException();

        if (credential.Status != CredentialStatus.Active)
            throw new CredentialNotActiveException();

        var isIdentityDocument = credential.IdentityDocument != null;
        var mandatoryFields = isIdentityDocument
            ? QrFieldDefinitions.IdentityDocumentMandatoryFields
            : QrFieldDefinitions.DriversLicenseMandatoryFields;
        var optionalFields = isIdentityDocument
            ? QrFieldDefinitions.IdentityDocumentOptionalFields
            : QrFieldDefinitions.DriversLicenseOptionalFields;
        var allowedFields = new HashSet<string>(mandatoryFields.Concat(optionalFields));

        var invalidFields = request.DisclosedFields.Where(f => !allowedFields.Contains(f)).ToList();
        var missingMandatoryFields = mandatoryFields.Where(f => !request.DisclosedFields.Contains(f)).ToList();

        if (invalidFields.Count > 0 || missingMandatoryFields.Count > 0)
            throw new InvalidDisclosedFieldsException(invalidFields.Concat(missingMandatoryFields));

        var issuedAt = DateTime.UtcNow;
        var expiresAt = issuedAt.AddSeconds(QrLifetimeSeconds);
        var jti = Guid.NewGuid();

        await _qrDisclosureTokenRepository.InvalidateActiveTokensForCredentialAsync(credential.Id);

        await _qrDisclosureTokenRepository.AddAsync(new QrDisclosureToken
        {
            Id = Guid.NewGuid(),
            Jti = jti,
            CredentialId = credential.Id,
            ExpiresAt = expiresAt,
            CreatedAt = issuedAt,
            UpdatedAt = issuedAt,
        });

        var payload = new QrPayload
        {
            Type = "disclosure",
            Jti = jti,
            CredentialId = credential.Id,
            DisclosedFields = request.DisclosedFields,
            IssuedAt = issuedAt,
            ExpiresAt = expiresAt,
        };

        var payloadJson = JsonSerializer.Serialize(payload, CamelCaseOptions);
        var payloadBytes = System.Text.Encoding.UTF8.GetBytes(payloadJson);

        var activeKey = await _qrSigningProvider.GetActiveKeyAsync(CancellationToken.None);
        var signatureBytes = await _qrSigningProvider.SignAsync(activeKey.KeyId, payloadBytes, CancellationToken.None);

        var envelope = new QrEnvelope
        {
            Payload = Convert.ToBase64String(payloadBytes),
            Signature = Convert.ToBase64String(signatureBytes),
            Kid = activeKey.KeyId,
            Alg = activeKey.Algorithm,
        };

        var token = Convert.ToBase64String(
            System.Text.Encoding.UTF8.GetBytes(JsonSerializer.Serialize(envelope, CamelCaseOptions)));

        return new GenerateQrResponseDto
        {
            Token = token,
            ExpiresAt = expiresAt,
        };
    }

    private sealed class QrPayload
    {
        public string Type { get; set; } = "disclosure";
        public Guid Jti { get; set; }
        public Guid CredentialId { get; set; }
        public List<string> DisclosedFields { get; set; } = new();
        public DateTime IssuedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
    }

    private sealed class QrEnvelope
    {
        public string Payload { get; set; } = string.Empty;
        public string Signature { get; set; } = string.Empty;
        public string Kid { get; set; } = string.Empty;
        public string Alg { get; set; } = string.Empty;
    }

    public async Task<List<CredentialSummaryDto>> GetMyCredentialsAsync(Guid userId)
    {
        var credentials = await _credentialRepository.GetByUserIdAsync(userId);

        return credentials
            .Where(c => c.Status == CredentialStatus.Active)
            .Select(c => new CredentialSummaryDto
            {
                Id = c.Id,
                CredentialType = c.IdentityDocument != null
                    ? "Identity Document"
                    : c.DriversLicense != null
                        ? "Driver's License"
                        : "Unknown",
            })
            .ToList();
    }

    public async Task<ResolveCredentialResponseDto> ResolveAsync(string token, Guid requestingUserId, string ipAddress)
    {
        QrEnvelope envelope;
        QrPayload payload;

        Guid? verifiedCredentialId = null;

        try
        {
            var envelopeJson = Encoding.UTF8.GetString(Convert.FromBase64String(token));
            envelope = JsonSerializer.Deserialize<QrEnvelope>(envelopeJson, CamelCaseOptions) ?? throw new InvalidDisclosureTokenException();
            var payloadBytes = Convert.FromBase64String(envelope.Payload);
            var payloadJson = Encoding.UTF8.GetString(payloadBytes);
            var signatureBytes = Convert.FromBase64String(envelope.Signature);

            if (!await _qrSignatureVerifier.VerifyAsync(envelope.Kid, envelope.Alg, payloadBytes, signatureBytes, CancellationToken.None)) throw new InvalidDisclosureTokenException();
            payload = JsonSerializer.Deserialize<QrPayload>(payloadJson, CamelCaseOptions) ?? throw new InvalidDisclosureTokenException();
            verifiedCredentialId = payload.CredentialId;
        }
        catch (Exception ex)
    when (ex is InvalidDisclosureTokenException or FormatException or JsonException)
        {
            await _institutionRepository.AddAuditLogAsync(new AuditLog
            {
                Id = Guid.NewGuid(),
                ActorId = requestingUserId,
                EventType = AuditEventType.CitizenVerificationFailed,
                Details = "QR disclosure verification failed.",
                IpAddress = ipAddress,
                CredentialId = verifiedCredentialId,
                CreatedAt = DateTime.UtcNow,
            });
            await _institutionRepository.SaveChangesAsync();
            throw new InvalidDisclosureTokenException();
        }

        if (payload.Type != "disclosure") throw new InvalidDisclosureTokenException();
        if (payload.ExpiresAt <= DateTime.UtcNow) throw new InvalidDisclosureTokenException();

        var claimed = await _qrDisclosureTokenRepository.TryMarkUsedAsync(payload.Jti);
        if (!claimed) throw new InvalidDisclosureTokenException();

        var cred = await _credentialRepository.GetByIdAsync(payload.CredentialId);
        if (cred == null || cred.Status != CredentialStatus.Active)
            throw new InvalidDisclosureTokenException();

        var credType = cred.IdentityDocument != null ? "Identity Document" : "Driver's License";
        var disclosedFields = await _disclosedFieldsValueResolver.ResolveAsync(cred, payload.DisclosedFields);

        await _institutionRepository.AddAuditLogAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            ActorId = requestingUserId,
            EventType = AuditEventType.CredentialVerified,
            Details = $"Credential {cred.Id} verified via QR disclosure ({disclosedFields.Count} field(s)).",
            IpAddress = ipAddress,
            CredentialId = cred.Id,
            CreatedAt = DateTime.UtcNow,
            CitizenId = cred.CitizenId,
        });
        await _institutionRepository.SaveChangesAsync();

        return new ResolveCredentialResponseDto
        {
            CredentialType = credType,
            DisclosedFields = disclosedFields,
        };
    }
}