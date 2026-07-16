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

        var credentialType = credential.IdentityDocument != null ? DisclosableFields.IdentityDocumentType : DisclosableFields.DriversLicenseType;
        var allowedFields = DisclosableFields.For(credentialType);
        var allowedKeys = allowedFields.Select(f => f.Key).ToHashSet();
        var mandatoryKeys = allowedFields.Where(f => f.Mandatory).Select(f => f.Key).ToHashSet();
        var unknownKeys = request.DisclosedFields.Where(k => !allowedKeys.Contains(k)).ToList();
        if (unknownKeys.Count > 0) throw new UnknownDisclosureFieldException(unknownKeys);
        var missingMandatoryKeys = mandatoryKeys.Where(k => !request.DisclosedFields.Contains(k)).ToList();
        if (missingMandatoryKeys.Count > 0) throw new MissingMandatoryFieldsException(missingMandatoryKeys);

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
                CredentialType = c.IdentityDocument != null ? "Identity Document" : "Driver's License",
            })
            .ToList();
    }
}