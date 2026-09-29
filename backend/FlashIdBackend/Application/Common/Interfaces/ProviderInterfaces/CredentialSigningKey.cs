namespace Application.Common.Interfaces.ProviderInterfaces;

// The key a credential is signed with: id and algorithm for the token header, public half for verifiers. 
public sealed record CredentialSigningKey(string KeyId, string Algorithm, EcPublicJwk PublicJwk);