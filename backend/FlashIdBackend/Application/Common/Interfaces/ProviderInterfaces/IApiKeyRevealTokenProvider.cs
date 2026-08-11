namespace Application.Common.Interfaces.ProviderInterfaces;

public record ApiKeyRevealPayload(Guid TokenId, Guid InstitutionId, string ApiKey);

public interface IApiKeyRevealTokenProvider
{
    public string Protect(Guid tokenId, Guid institutionId, string apiKey, TimeSpan lifetime);
    public ApiKeyRevealPayload? Unprotect(string token);
}