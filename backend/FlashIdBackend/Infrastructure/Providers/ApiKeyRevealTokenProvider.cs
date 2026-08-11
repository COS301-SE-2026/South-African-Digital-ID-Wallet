using Application.Common.Interfaces.ProviderInterfaces;
using Microsoft.AspNetCore.DataProtection;

namespace Infrastructure.Providers;

public class ApiKeyRevealTokenProvider : IApiKeyRevealTokenProvider
{
    private const string ProtectorPurpose = "Institution.ApiKeyReveal.v1";
    private const char FieldSeparator = '|';

    private readonly ITimeLimitedDataProtector _protector;

    public ApiKeyRevealTokenProvider(IDataProtectionProvider dataProtectionProvider)
    {
        _protector = dataProtectionProvider
            .CreateProtector(ProtectorPurpose)
            .ToTimeLimitedDataProtector();
    }

    public string Protect(Guid tokenId, Guid institutionId, string apiKey, TimeSpan lifetime)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(apiKey);

        if (apiKey.Contains(FieldSeparator))
            throw new InvalidOperationException("API key contains an invalid character.");

        var payload = string.Join(FieldSeparator, tokenId, institutionId, apiKey);
        return _protector.Protect(payload, lifetime);
    }

    public ApiKeyRevealPayload? Unprotect(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return null;

        try
        {
            var payload = _protector.Unprotect(token);
            var parts = payload.Split(FieldSeparator, 3);

            if (parts.Length != 3)
                return null;

            if (!Guid.TryParse(parts[0], out var tokenId) || !Guid.TryParse(parts[1], out var institutionId))
                return null;

            return new ApiKeyRevealPayload(tokenId, institutionId, parts[2]);
        }
        catch
        {
            return null;
        }
    }
}