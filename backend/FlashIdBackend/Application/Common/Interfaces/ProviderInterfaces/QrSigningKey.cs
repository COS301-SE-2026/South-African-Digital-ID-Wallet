namespace Application.Common.Interfaces.ProviderInterfaces;

public sealed record QrSigningKey(string KeyId, string Algorithm, EcPublicJwk PublicJwk);