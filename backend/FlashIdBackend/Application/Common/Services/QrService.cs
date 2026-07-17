using System.Text.Json;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Credentials;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Exceptions;
using Domain.Enums;

namespace Application.Common.Services;

public class QrService : IQrService
{
    private const int QrLifetimeSeconds = 60;

    private readonly ICredentialRepository _credentialRepository;
    private readonly IQrSigningProvider _qrSigningProvider;

    public QrService(ICredentialRepository credentialRepository, IQrSigningProvider qrSigningProvider)
    {
        _credentialRepository = credentialRepository;
        _qrSigningProvider = qrSigningProvider;
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

        var payload = new QrPayload
        {
            CredentialId = credential.Id,
            DisclosedFields = request.DisclosedFields,
            IssuedAt = issuedAt,
            ExpiresAt = expiresAt,
        };

        var payloadJson = JsonSerializer.Serialize(payload);
        var signature = _qrSigningProvider.Sign(payloadJson);

        var envelope = new QrEnvelope
        {
            Payload = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(payloadJson)),
            Signature = signature,
        };

        var token = Convert.ToBase64String(
            System.Text.Encoding.UTF8.GetBytes(JsonSerializer.Serialize(envelope)));

        return new GenerateQrResponseDto
        {
            Token = token,
            ExpiresAt = expiresAt,
        };
    }

    private class QrPayload
    {
        public Guid CredentialId { get; set; }
        public List<string> DisclosedFields { get; set; } = new();
        public DateTime IssuedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
    }

    private class QrEnvelope
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
}