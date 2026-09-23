using System.Security.Principal;
using System.Text;
using System.Text.Json;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Officials.DTOs;
using Application.Features.Officials.Exceptions;

namespace Application.Common.Services;

public class OfficialBadgeService : IOfficialBadgeService
{
    private const int BadgeLifetimeInSeconds = 60;

    private readonly IOfficialRepository _officialRepository;
    private readonly IQrSigningProvider _qrSigningProvider;
    private readonly IQrSignatureVerifier _qrSignatureVerifier;

    public OfficialBadgeService(IOfficialRepository officialRepository, IQrSigningProvider qrSigningProvider, IQrSignatureVerifier qrSignatureVerifier)
    {
        _officialRepository = officialRepository;
        _qrSigningProvider = qrSigningProvider;
        _qrSignatureVerifier = qrSignatureVerifier;
    }

    public async Task<GenerateBadgeTokenResponseDto> GenerateBadgeTokenAsync(Guid userId)
    {
        var official = await _officialRepository.GetByUserIdAsync(userId);
        if (official == null) throw new OfficialNotFoundException();

        var issuedAt = DateTime.UtcNow;
        var expiresAt = issuedAt.AddSeconds(BadgeLifetimeInSeconds);

        var payload = new BadgePayload
        {
            Type = "badge",
            OfficialId = official.Id,
            InstitutionId = official.InstitutionId,
            IssuedAt = issuedAt,
            ExpiresAt = expiresAt,
        };

        var payloadJson = JsonSerializer.Serialize(payload);
        var payloadBytes = Encoding.UTF8.GetBytes(payloadJson);

        var activeKey = await _qrSigningProvider.GetActiveKeyAsync(CancellationToken.None);
        var signatureBytes = await _qrSigningProvider.SignAsync(activeKey.KeyId, payloadBytes, CancellationToken.None);

        var envelope = new BadgeEnvelope
        {
            Payload = Convert.ToBase64String(payloadBytes),
            Signature = Convert.ToBase64String(signatureBytes),
            Kid = activeKey.KeyId,
            Alg = activeKey.Algorithm,
        };

        var token = Convert.ToBase64String(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(envelope)));

        return new GenerateBadgeTokenResponseDto
        {
            Token = token,
            ExpiresAt = expiresAt,
        };
    }

    public async Task<VerifyBadgeResponseDto> VerifyBadgeAsync(string token)
    {
        BadgeEnvelope envelope;
        BadgePayload payload;

        try
        {
            var envelopeJson = Encoding.UTF8.GetString(Convert.FromBase64String(token));
            envelope = JsonSerializer.Deserialize<BadgeEnvelope>(envelopeJson) ?? throw new InvalidBadgeTokenException();
            var payloadBytes = Convert.FromBase64String(envelope.Payload);
            var payloadJson = Encoding.UTF8.GetString(payloadBytes);
            var signatureBytes = Convert.FromBase64String(envelope.Signature);

            if (!await _qrSignatureVerifier.VerifyAsync(envelope.Kid, payloadBytes, signatureBytes, CancellationToken.None)) throw new InvalidBadgeTokenException();
            payload = JsonSerializer.Deserialize<BadgePayload>(payloadJson) ?? throw new InvalidBadgeTokenException();
        }
        catch (Exception n) when (n is FormatException or JsonException)
        {
            throw new InvalidBadgeTokenException();
        }

        if (payload.Type != "badge") throw new InvalidBadgeTokenException();

        if (payload.ExpiresAt <= DateTime.UtcNow) throw new InvalidBadgeTokenException();

        var official = await _officialRepository.GetByIdAsync(payload.OfficialId);
        if (official == null || official.InstitutionId != payload.InstitutionId) throw new InvalidBadgeTokenException();

        var institutionType = official.Institution.Type;

        return new VerifyBadgeResponseDto
        {
            InstitutionName = official.Institution.Name,
            InstitutionType = institutionType,
            Mode = InstitutionDisclosurePolicy.ModeFor(institutionType),
            SuggestedIdentityDocumentFields = InstitutionDisclosurePolicy
                .SuggestedFieldsFor(institutionType, isIdentityDocument: true)
                .ToList(),
            SuggestedDriversLicenseFields = InstitutionDisclosurePolicy
                .SuggestedFieldsFor(institutionType, isIdentityDocument: false)
                .ToList(),
        };
    }

    private sealed class BadgePayload
    {
        public string Type { get; set; } = "badge";
        public Guid OfficialId { get; set; }
        public Guid InstitutionId { get; set; }
        public DateTime IssuedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
    }

    private sealed class BadgeEnvelope
    {
        public string Payload { get; set; } = string.Empty;
        public string Signature { get; set; } = string.Empty;
        public string Kid { get; set; } = string.Empty;
        public string Alg { get; set; } = string.Empty;
    }
}