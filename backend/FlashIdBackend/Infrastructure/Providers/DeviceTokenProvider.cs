using System.Security.Cryptography;
using System.Text;
using Application.Common.Interfaces.ProviderInterfaces;
using Microsoft.AspNetCore.WebUtilities;

namespace Infrastructure.Providers;

public class DeviceTokenProvider : IDeviceTokenProvider
{
    public string GenerateToken()
    {
        var randomBytes = RandomNumberGenerator.GetBytes(32);
        return WebEncoders.Base64UrlEncode(randomBytes);
    }

    public string HashToken(string token)
    {
        var tokenBytes = Encoding.UTF8.GetBytes(token);
        var hashBytes = SHA256.HashData(tokenBytes);
        return Convert.ToHexString(hashBytes);
    }
}