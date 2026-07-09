namespace Application.Common.Interfaces.ProviderInterfaces;

public interface IPasswordHashingProvider
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string storedHash);
}