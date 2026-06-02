using Application.Common.Interfaces.ProviderInterfaces;

namespace Infrastructure.Providers;

public class PasswordHashingProvider : IPasswordHashingProvider
{
    public string HashPassword(string password)
    {
        // BCrypt automatically generates a random salt and embeds it in the hash string.
        // WorkFactor 12 means 2^12 = 4096 iterations — slow enough to resist brute force.
        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
    }

    public bool VerifyPassword(string password, string storedHash)
    {
        // BCrypt.Verify extracts the salt from storedHash, re-hashes the plain-text
        // password with the same salt, and compares. The comparison is timing-safe.
        return BCrypt.Net.BCrypt.Verify(password, storedHash);
    }
}