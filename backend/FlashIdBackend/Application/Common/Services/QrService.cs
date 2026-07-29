using System.Text;
using System.Text.Json;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Credentials;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Exceptions;
using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Services;

public class QrService : IQrService
{
    private const int QrLifetimeSeconds = 60;

    private readonly ICredentialRepository _credentialRepository;
    private readonly IQrSigningProvider _qrSigningProvider;
    private readonly IQrDisclosureTokenRepository _qrDisclosureTokenRepository;
    private readonly IInstitutionRepository _institutionRepository;

    private static readonly JsonSerializerOptions CamelCaseOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public QrService(ICredentialRepository credentialRepository, IQrSigningProvider qrSigningProvider, IQrDisclosureTokenRepository qrDisclosureTokenRepository, IInstitutionRepository institutionRepository)
    {
        _credentialRepository = credentialRepository;
        _qrSigningProvider = qrSigningProvider;
        _qrDisclosureTokenRepository = qrDisclosureTokenRepository;
        _institutionRepository = institutionRepository;
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
        var signature = _qrSigningProvider.Sign(payloadJson);

        var envelope = new QrEnvelope
        {
            Payload = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(payloadJson)),
            Signature = signature,
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

        try
        {
            var envelopeJson = Encoding.UTF8.GetString(Convert.FromBase64String(token));
            envelope = JsonSerializer.Deserialize<QrEnvelope>(envelopeJson, CamelCaseOptions) ?? throw new InvalidDisclosureTokenException();
            var payloadJson = Encoding.UTF8.GetString(Convert.FromBase64String(envelope.Payload));

            if (!_qrSigningProvider.Verify(payloadJson, envelope.Signature)) throw new InvalidDisclosureTokenException();

            payload = JsonSerializer.Deserialize<QrPayload>(payloadJson, CamelCaseOptions) ?? throw new InvalidDisclosureTokenException();
        }
        catch (Exception e) when (e is FormatException or JsonException)
        {
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
        var disclosedFields = DisclosedFieldValueResolver.Resolve(cred, payload.DisclosedFields);

        await _institutionRepository.AddAuditLogAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            ActorId = requestingUserId,
            EventType = AuditEventType.CredentialVerified,
            Details = $"Credential {cred.Id} verified via QR disclosure ({disclosedFields.Count} field(s)).",
            IpAddress = ipAddress,
            CreatedAt = DateTime.UtcNow,
        });
        await _institutionRepository.SaveChangesAsync();

        return new ResolveCredentialResponseDto
        {
            CredentialType = credType,
            DisclosedFields = disclosedFields,
        };
    }
}