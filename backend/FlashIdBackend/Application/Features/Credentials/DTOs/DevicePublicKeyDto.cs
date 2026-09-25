using Application.Common.Interfaces.ProviderInterfaces;

namespace Application.Features.Credentials.DTOs;

// The wallet's public holder key as a JWK. The credential factory checks it is a real P-256 point before anything is signed. 
public sealed record DevicePublicKeyDto(string Kty, string Crv, string X, string Y)
{
    // A device key has no kid. cnf and the RFC 7638 thumbprint use only kty, crv, x, and y.
    public EcPublicJwk ToJwk() => new(Kty, Crv, string.Empty, X, Y);
}
