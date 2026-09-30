using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;

namespace tests;

public class ConfigurationSecretsTests
{
    private static readonly Regex SecretSettingName = new(
        "^Key$|ApiKey|Secret|Password|ConnectionString|HmacKey",
        RegexOptions.IgnoreCase | RegexOptions.Compiled,
        TimeSpan.FromSeconds(1));

    [Theory]
    [InlineData("backend/FlashIdBackend/Presentation/appsettings.json")]
    [InlineData("government-registry/GovernmentRegistry/Presentation/appsettings.json")]
    public void CommittedAppSettings_ContainNoSecretValues(string relativePath)
    {
        var config = new ConfigurationBuilder()
            .AddJsonFile(FindRepoFile(relativePath), optional: false, reloadOnChange: false)
            .Build();

        var leakedSettings = config.AsEnumerable()
            .Where(setting => IsSecretSetting(setting.Key) && !string.IsNullOrWhiteSpace(setting.Value))
            .Select(setting => setting.Key)
            .ToList();

        Assert.True(
            leakedSettings.Count == 0,
            $"{relativePath} must not contain secret values, but these are set: {string.Join(", ", leakedSettings)}");
    }

    [Fact]
    public void CommittedBackendAppSettings_DeclaresTheExpectedSecretSettingsAsBlank()
    {
        var config = new ConfigurationBuilder()
            .AddJsonFile(FindRepoFile("backend/FlashIdBackend/Presentation/appsettings.json"), optional: false, reloadOnChange: false)
            .Build();

        string[] expectedBlank =
        [
            "ConnectionStrings:DefaultConnection",
            "Jwt:Key",
            "GovernmentRegistry:ApiKeyGov",
            "SmsPortal:ApiKey",
            "SmsPortal:ApiSecret",
            "BlobStorage:ConnectionString",
            "Cosmos:ConnectionString",
            "Cosmos:CredentialIdHmacKey",
            "IpGeolocation:ApiKey",
        ];

        foreach (var key in expectedBlank)
        {
            Assert.True(IsSecretSetting(key), $"{key} should be recognised as a secret setting");
            Assert.True(string.IsNullOrEmpty(config[key]), $"{key} must be blank in the committed appsettings.json");
        }
    }

    private static bool IsSecretSetting(string fullKey)
    {
        var leaf = fullKey.Split(':')[^1];
        return fullKey.StartsWith("ConnectionStrings:", StringComparison.OrdinalIgnoreCase)
            || SecretSettingName.IsMatch(leaf);
    }

    private static string FindRepoFile(string relativePath)
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null)
        {
            var candidate = Path.Combine(dir.FullName, relativePath);
            if (File.Exists(candidate))
            {
                return candidate;
            }
            dir = dir.Parent;
        }
        throw new FileNotFoundException($"Could not find {relativePath} above {AppContext.BaseDirectory}");
    }
}