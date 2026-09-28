namespace Application.Common.Interfaces.ProviderInterfaces;

public interface IQrSigningProvider
{
    Task<QrSigningKey> GetActiveKeyAsync(CancellationToken cancellationToken);
    Task<byte[]> SignAsync(string keyId, byte[] signingInput, CancellationToken cancellationToken);
}