using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.WebUtilities;

namespace Infrastructure.Providers;

public class DeviceTokenProvider
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