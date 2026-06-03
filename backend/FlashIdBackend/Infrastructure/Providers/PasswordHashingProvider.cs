using Application.Common.Interfaces.ProviderInterfaces;

namespace Infrastructure.Providers;

public class PasswordHashingProvider : IPasswordHashingProvider
{
    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
    }

    public bool VerifyPassword(string password, string storedHash)
    {
        return BCrypt.Net.BCrypt.Verify(password, storedHash);
    }
}