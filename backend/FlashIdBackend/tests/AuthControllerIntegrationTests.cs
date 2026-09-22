using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Features.Auth.DTOs;
using Application.Features.ManageUserAccountCard.DTOs;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Providers;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;

namespace tests;

public class AuthControllerIntegrationTests
{
    private const string JwtKey = "integration-test-secret-key-which-is-long-enough"; // NOSONAR - test-only dummy key, not a real secret
    private const string JwtIssuer = "FlashId";
    private const string JwtAudience = "FlashIdWeb";

    private const string TestPassword = "CitizenPwd123!"; // NOSONAR - test-only dummy credential, not a real secret
    private const string WrongPassword = "InvalidPwd123!"; // NOSONAR - test-only dummy credential, not a real secret
    private const string DeviceToken = "trusted-device-token"; // NOSONAR - test-only dummy credential, not a real secret
    private const string CorrectOtp = "123456"; // NOSONAR - test-only dummy credential, not a real secret

    private const string DeviceVerificationCookie = "flashid_device_verification";
    private const string AccessTokenCookie = "access_token";
    private const string DeviceCookie = "flashid_device";

    private static string Sha256Hex(string value) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value)));

    private sealed class StubEmailSenderProvider : IEmailSenderProvider
    {
        public Task SendEmailAsync(string toEmail, string subject, string message, CancellationToken ct = default) =>
            Task.CompletedTask;
    }

    private sealed class StubIpGeolocationProvider : IIpGeolocationProvider
    {
        public Task<IpLocationResult?> GetLocationAsync(string ipAddress, CancellationToken cancellationToken) =>
        Task.FromResult<IpLocationResult?>(new IpLocationResult { City = "Pretoria", Country = "South Africa" });
    }

    private sealed class TestApiFactory : WebApplicationFactory<Program>
    {
        private readonly SqliteConnection _connection = new("DataSource=:memory:");

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["Jwt:Key"] = JwtKey,
                    ["Jwt:Issuer"] = JwtIssuer,
                    ["Jwt:Audience"] = JwtAudience,
                });
            });

            builder.ConfigureServices(services =>
            {
                _connection.Open();

                services.AddDbContext<AppDbContext>(options => options.UseSqlite(_connection));

                services.RemoveAll(typeof(IEmailSenderProvider));
                services.AddScoped<IEmailSenderProvider, StubEmailSenderProvider>();

                services.RemoveAll(typeof(IIpGeolocationProvider));
                services.AddScoped<IIpGeolocationProvider, StubIpGeolocationProvider>();

                services.RemoveAll(typeof(IHostedService));
            });
        }

        public async Task<AppDbContext> CreateInitializedContextAsync()
        {
            var scope = Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            await db.Database.EnsureCreatedAsync();

            return db;
        }

        public string ProtectVerificationId(Guid verificationId)
        {
            var provider = Services.GetRequiredService<IDataProtectionProvider>();
            return provider.CreateProtector("FlashID.DeviceVerification").Protect(verificationId.ToString());
        }

        public HttpClient CreateApiClient() =>
            CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);
            if (disposing)
            {
                _connection.Dispose();
            }
        }
    }

    private static string GenerateTokenFor(User user)
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = JwtKey,
            ["Jwt:Issuer"] = JwtIssuer,
            ["Jwt:Audience"] = JwtAudience,
        }).Build();

        return new JwtTokenProvider(config).GenerateToken(user).Token;
    }

    private static User BuildUser(
        UserRole role = UserRole.Citizen,
        bool emailVerified = true,
        bool isDeleted = false,
        DateTime? lockoutUntil = null) => new()
        {
            Id = Guid.NewGuid(),
            Email = $"user-{Guid.NewGuid():N}@flashid.test",
            PhoneNumber = "+27821234567",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(TestPassword), // NOSONAR - not a real secret
            Role = role,
            IsEmailVerified = emailVerified,
            IsDeleted = isDeleted,
            LockoutUntil = lockoutUntil,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

    private static async Task<User> SeedUserAsync(TestApiFactory factory, User user)
    {
        var db = await factory.CreateInitializedContextAsync();
        await db.DomainUsers.AddAsync(user, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);
        return user;
    }

    private static async Task SeedTrustedDeviceAsync(TestApiFactory factory, User user)
    {
        var db = await factory.CreateInitializedContextAsync();
        await db.TrustedDevices.AddAsync(new TrustedDevice
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            DeviceTokenHash = Sha256Hex(DeviceToken),
            DeviceType = DeviceType.Desktop,
            OperatingSystem = "Windows 11",
            Browser = "Chrome",
            DeviceName = "Test Device",
            LastActive = DateTime.UtcNow.AddDays(-1),
            IsTrusted = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        }, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);
    }

    private static async Task<DeviceVerification> SeedDeviceVerificationAsync(TestApiFactory factory, User user)
    {
        var db = await factory.CreateInitializedContextAsync();
        var verification = new DeviceVerification
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            OtpHash = Sha256Hex(CorrectOtp),
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            AttemptCount = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await db.DeviceVerifications.AddAsync(verification, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);
        return verification;
    }

    private static string? SetCookieValue(HttpResponseMessage response, string name)
    {
        if (!response.Headers.TryGetValues("Set-Cookie", out var cookies)) return null;

        var cookie = cookies.FirstOrDefault(c => c.StartsWith($"{name}=", StringComparison.Ordinal));
        if (cookie is null) return null;

        return cookie.Split(';')[0][(name.Length + 1)..];
    }

    private static async Task<JsonElement> ReadBodyAsync(HttpResponseMessage response) =>
        await response.Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken);

    private static VerifyDeviceRequestDto VerifyRequest(Guid verificationId, string otp = CorrectOtp) => new()
    {
        DeviceVerificationId = verificationId,
        Otp = otp,
        DeviceType = DeviceType.Desktop,
        OperatingSystem = "Windows 11",
        Browser = "Chrome",
        DeviceName = "Test Device",
        RememberMe = false,
    };

    [Fact]
    public async Task Me_WithoutAToken_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        await factory.CreateInitializedContextAsync();
        var client = factory.CreateApiClient();

        var response = await client.GetAsync("/api/auth/me", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Me_WithAValidToken_ReturnsTheProfile()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory, BuildUser(UserRole.GovernmentAdministrator));
        var client = factory.CreateApiClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GenerateTokenFor(user));

        var response = await client.GetAsync("/api/auth/me", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadBodyAsync(response);
        Assert.Equal(user.Id, body.GetProperty("userId").GetGuid());
        Assert.Equal(user.Email, body.GetProperty("email").GetString());
        Assert.Equal(nameof(UserRole.GovernmentAdministrator), body.GetProperty("role").GetString());
    }

    [Fact]
    public async Task Me_WithATokenForAUserThatNoLongerExists_IsRejectedAtAuthentication()
    {
        using var factory = new TestApiFactory();
        await factory.CreateInitializedContextAsync();
        var client = factory.CreateApiClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", GenerateTokenFor(BuildUser()));

        var response = await client.GetAsync("/api/auth/me", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Me_WithATokenFromEarlierTokenVersion_IsRejectedAsRevoked()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory, BuildUser());
        var staleToken = GenerateTokenFor(user);

        var db = await factory.CreateInitializedContextAsync();
        var stored = await db.DomainUsers.FirstAsync(u => u.Id == user.Id, TestContext.Current.CancellationToken);
        stored.TokenVersion++;
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var client = factory.CreateApiClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", staleToken);

        var response = await client.GetAsync("/api/auth/me", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithAnUnknownEmail_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        await factory.CreateInitializedContextAsync();
        var client = factory.CreateApiClient();

        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new LoginRequestDto { Email = "nobody@flashid.test", Password = TestPassword },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithTheWrongPassword_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory, BuildUser());
        var client = factory.CreateApiClient();

        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new LoginRequestDto { Email = user.Email, Password = WrongPassword },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithADeletedAccount_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory, BuildUser(isDeleted: true));
        var client = factory.CreateApiClient();

        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new LoginRequestDto { Email = user.Email, Password = TestPassword },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithALockedAccount_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory, BuildUser(lockoutUntil: DateTime.UtcNow.AddMinutes(20)));
        var client = factory.CreateApiClient();

        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new LoginRequestDto { Email = user.Email, Password = TestPassword },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithAnUnverifiedEmail_ReturnsForbiddenWithAMachineReadableCode()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory, BuildUser(emailVerified: false));
        var client = factory.CreateApiClient();

        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new LoginRequestDto { Email = user.Email, Password = TestPassword },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        var body = await ReadBodyAsync(response);
        Assert.Equal("EMAIL_NOT_VERIFIED", body.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Login_FromAnUnrecognisedDevice_DemandsVerificationAndIssuesNoAccessToken()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory, BuildUser());
        var client = factory.CreateApiClient();

        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new LoginRequestDto { Email = user.Email, Password = TestPassword },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadBodyAsync(response);
        Assert.True(body.GetProperty("requiresDeviceVerification").GetBoolean());
        Assert.Equal(string.Empty, body.GetProperty("token").GetString());

        Assert.NotNull(SetCookieValue(response, DeviceVerificationCookie));
        Assert.Null(SetCookieValue(response, AccessTokenCookie));
    }

    [Fact]
    public async Task Login_FromATrustedDevice_SetsTheAccessCookieAndWithholdsTheTokenFromTheBody()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory, BuildUser());
        await SeedTrustedDeviceAsync(factory, user);
        var client = factory.CreateApiClient();
        client.DefaultRequestHeaders.Add("X-Device-Token", DeviceToken);

        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new LoginRequestDto { Email = user.Email, Password = TestPassword },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadBodyAsync(response);
        Assert.False(body.GetProperty("requiresDeviceVerification").GetBoolean());
        Assert.False(body.TryGetProperty("token", out _));

        var accessCookie = SetCookieValue(response, AccessTokenCookie);
        Assert.False(string.IsNullOrWhiteSpace(accessCookie));
    }

    [Fact]
    public async Task Login_FromANativeMobileClient_ReturnsTheTokenInTheBody()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory, BuildUser());
        await SeedTrustedDeviceAsync(factory, user);
        var client = factory.CreateApiClient();
        client.DefaultRequestHeaders.Add("X-Device-Token", DeviceToken);
        client.DefaultRequestHeaders.Add("X-Client", "mobile");

        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new LoginRequestDto { Email = user.Email, Password = TestPassword },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadBodyAsync(response);
        Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("token").GetString()));
    }

    [Fact]
    public async Task Login_FromABrowserClaimingToBeMobile_StillWithholdsTheToken()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory, BuildUser());
        await SeedTrustedDeviceAsync(factory, user);
        var client = factory.CreateApiClient();
        client.DefaultRequestHeaders.Add("X-Device-Token", DeviceToken);
        client.DefaultRequestHeaders.Add("X-Client", "mobile");
        client.DefaultRequestHeaders.Add("Origin", "https://flashid.test");

        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new LoginRequestDto { Email = user.Email, Password = TestPassword },
            TestContext.Current.CancellationToken);

        var body = await ReadBodyAsync(response);
        Assert.False(body.TryGetProperty("token", out _));
    }

    [Fact]
    public async Task VerifyDevice_WithTheWrongOtp_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory, BuildUser());
        var verification = await SeedDeviceVerificationAsync(factory, user);
        var client = factory.CreateApiClient();

        var response = await client.PostAsJsonAsync(
            "/api/auth/verify-device",
            VerifyRequest(verification.Id, otp: "000000"),
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task VerifyDevice_WithTheCorrectOtp_SetsBothCookiesAndClearsTheVerificationCookie()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory, BuildUser());
        var verification = await SeedDeviceVerificationAsync(factory, user);
        var client = factory.CreateApiClient();

        var response = await client.PostAsJsonAsync(
            "/api/auth/verify-device",
            VerifyRequest(verification.Id),
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(string.IsNullOrWhiteSpace(SetCookieValue(response, AccessTokenCookie)));
        Assert.False(string.IsNullOrWhiteSpace(SetCookieValue(response, DeviceCookie)));
        Assert.Equal(string.Empty, SetCookieValue(response, DeviceVerificationCookie));
    }

    [Fact]
    public async Task VerifyDevice_ForANativeMobileClient_ReturnsBothTokensInTheBody()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory, BuildUser());
        var verification = await SeedDeviceVerificationAsync(factory, user);
        var client = factory.CreateApiClient();
        client.DefaultRequestHeaders.Add("X-Client", "mobile");

        var response = await client.PostAsJsonAsync(
            "/api/auth/verify-device",
            VerifyRequest(verification.Id),
            TestContext.Current.CancellationToken);

        var body = await ReadBodyAsync(response);
        Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("token").GetString()));
        Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("deviceToken").GetString()));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task ResendDeviceVerification_WithoutAnId_ReturnsBadRequest(string verificationId)
    {
        using var factory = new TestApiFactory();
        await factory.CreateInitializedContextAsync();
        var client = factory.CreateApiClient();

        var response = await client.PostAsJsonAsync(
            "/api/auth/resend-device-verification",
            new ResendDeviceVerificationRequestDto { DeviceVerificationId = verificationId },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ResendDeviceVerification_WithAMalformedId_ReturnsBadRequest()
    {
        using var factory = new TestApiFactory();
        await factory.CreateInitializedContextAsync();
        var client = factory.CreateApiClient();

        var response = await client.PostAsJsonAsync(
            "/api/auth/resend-device-verification",
            new ResendDeviceVerificationRequestDto { DeviceVerificationId = "not-a-guid" },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ResendDeviceVerification_WithoutTheSessionCookie_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        await factory.CreateInitializedContextAsync();
        var client = factory.CreateApiClient();

        var response = await client.PostAsJsonAsync(
            "/api/auth/resend-device-verification",
            new ResendDeviceVerificationRequestDto { DeviceVerificationId = Guid.NewGuid().ToString() },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ResendDeviceVerification_WithATamperedSessionCookie_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        await factory.CreateInitializedContextAsync();
        var client = factory.CreateApiClient();

        var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/resend-device-verification")
        {
            Content = JsonContent.Create(new ResendDeviceVerificationRequestDto
            {
                DeviceVerificationId = Guid.NewGuid().ToString(),
            }),
        };
        request.Headers.Add("Cookie", $"{DeviceVerificationCookie}=tampered-value");

        var response = await client.SendAsync(request, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ResendDeviceVerification_WhenTheCookieNamesADifferentSession_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        await factory.CreateInitializedContextAsync();
        var client = factory.CreateApiClient();

        var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/resend-device-verification")
        {
            Content = JsonContent.Create(new ResendDeviceVerificationRequestDto
            {
                DeviceVerificationId = Guid.NewGuid().ToString(),
            }),
        };
        request.Headers.Add("Cookie", $"{DeviceVerificationCookie}={factory.ProtectVerificationId(Guid.NewGuid())}");

        var response = await client.SendAsync(request, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ResendDeviceVerification_WithAMatchingSessionCookie_ResendsTheCode()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory, BuildUser());
        var verification = await SeedDeviceVerificationAsync(factory, user);
        var client = factory.CreateApiClient();

        var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/resend-device-verification")
        {
            Content = JsonContent.Create(new ResendDeviceVerificationRequestDto
            {
                DeviceVerificationId = verification.Id.ToString(),
            }),
        };
        request.Headers.Add("Cookie", $"{DeviceVerificationCookie}={factory.ProtectVerificationId(verification.Id)}");

        var response = await client.SendAsync(request, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Logout_WithoutAToken_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        await factory.CreateInitializedContextAsync();
        var client = factory.CreateApiClient();

        var response = await client.PostAsync("/api/auth/logout", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Logout_WithAValidToken_ClearsTheAccessCookie()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory, BuildUser());
        var client = factory.CreateApiClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GenerateTokenFor(user));

        var response = await client.PostAsync("/api/auth/logout", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(string.Empty, SetCookieValue(response, AccessTokenCookie));
    }
}
