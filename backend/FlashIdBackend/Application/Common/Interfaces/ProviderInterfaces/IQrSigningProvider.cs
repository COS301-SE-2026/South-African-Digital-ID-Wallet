namespace Application.Common.Interfaces.ProviderInterfaces;

public interface IQrSigningProvider
{
    string Sign(string payload);
    bool Verify(string payload, string signature);
}