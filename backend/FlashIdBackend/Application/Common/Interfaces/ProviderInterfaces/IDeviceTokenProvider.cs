namespace Application.Common.Interfaces.ProviderInterfaces;

public interface IDeviceTokenProvider
{
    public string GenerateToken();
    public string HashToken(string token);
}