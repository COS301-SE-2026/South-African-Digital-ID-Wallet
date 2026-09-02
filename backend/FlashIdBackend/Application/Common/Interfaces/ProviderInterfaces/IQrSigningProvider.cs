namespace Application.Common.Interfaces.ProviderInterfaces;

public interface IQrSigningProvider
{
    string CurrentKeyId { get; }
    string Sign(string payload);
    bool Verify(string payload, string signature, string keyId);
}