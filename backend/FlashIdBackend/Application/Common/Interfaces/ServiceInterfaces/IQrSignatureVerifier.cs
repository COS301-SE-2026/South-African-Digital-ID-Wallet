namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IQrSignatureVerifier
{
    Task<bool> VerifyAsync(string kid, byte[] signingInput, byte[] signature, CancellationToken cancellationToken);
}