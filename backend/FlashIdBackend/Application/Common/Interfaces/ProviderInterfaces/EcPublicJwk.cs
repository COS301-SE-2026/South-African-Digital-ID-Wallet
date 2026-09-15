namespace Application.Common.Interfaces.ProviderInterfaces;

public sealed record EcPublicJwk(string Kty, string Crv, string Kid, string X, String Y);