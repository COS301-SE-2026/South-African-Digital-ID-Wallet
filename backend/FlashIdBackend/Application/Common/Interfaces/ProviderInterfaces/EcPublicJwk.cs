namespace Application.Common.Interfaces.ProviderInterfaces;

// P-256 public key in JSON Web Key form. X and Y are the base64url curve coordinates.
public sealed record EcPublicJwk(string Kty, string Crv, string Kid, string X, string Y);