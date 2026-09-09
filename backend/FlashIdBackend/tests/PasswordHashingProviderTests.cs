using Infrastructure.Providers;

namespace tests;

public class PasswordHashingProviderTests
{
    private const string TestPassword = "CitizenPwd123!"; // NOSONAR - not a real secret
    private const string WrongPassword = "InvalidPwd123!"; // NOSONAR - not a real secret

    [Fact]
    public void HashPassword_WithValidPassword_ReturnsBcryptHashThatIsNotThePlaintext()
    {
        var provider = new PasswordHashingProvider();

        var hash = provider.HashPassword(TestPassword);

        Assert.NotEqual(TestPassword, hash);
        Assert.StartsWith("$2", hash);
    }

    [Fact]
    public void HashPassword_CalledTwiceForSamePassword_ProducesDifferentSaltedHashes()
    {
        var provider = new PasswordHashingProvider();

        var first = provider.HashPassword(TestPassword);
        var second = provider.HashPassword(TestPassword);

        Assert.NotEqual(first, second);
    }

    [Fact]
    public void VerifyPassword_WithHashProducedByHashPassword_ReturnsTrue()
    {
        var provider = new PasswordHashingProvider();
        var hash = provider.HashPassword(TestPassword);

        Assert.True(provider.VerifyPassword(TestPassword, hash));
    }

    [Fact]
    public void VerifyPassword_WithWrongPassword_ReturnsFalse()
    {
        var provider = new PasswordHashingProvider();
        var hash = provider.HashPassword(TestPassword);

        Assert.False(provider.VerifyPassword(WrongPassword, hash));
    }
}
