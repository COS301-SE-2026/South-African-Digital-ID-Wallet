using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Auth.DTOs;
using Application.Features.Auth.Exceptions;
using Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Hosting;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Data;

namespace tests;

public class AuthControllerTests
{
    private const string JwtKey = "integration-test-secret-key-which-is-long-enough"; // NOSONAR
    private const string JwtIssuer = "FlashId";
    private const string JwtAudience = "FlashIdWeb";

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
    };

    private sealed class StubAuthService : IAuthService
    {
        public LoginResponseDto? LoginResultToReturn { get; set; }
        public Exception? LoginException { get; set; }
        public LoginResponseDto? VerifyDeviceResultToReturn { get; set; }
        public Exception? VerifyDeviceException { get; set; }
        public LogoutResponseDto? LogoutResultToReturn { get; set; }
        public UserProfileDto? CurrentUserToReturn { get; set; }

        public Task<LoginResponseDto> LoginAsync(LoginRequestDto request, string? deviceToken, string ipAddress, CancellationToken cancellationToken)
        {
            if (LoginException is not null) throw LoginException;
            return Task.FromResult(LoginResultToReturn!);
        }

        public Task<LogoutResponseDto> LogoutAsync(Guid userId, string ipAddress)
        {
            return Task.FromResult(LogoutResultToReturn ?? new LogoutResponseDto { Message = "Logged out." });
        }

        public Task<UserProfileDto?> GetCurrentUserAsync(Guid userId)
        {
            return Task.FromResult(CurrentUserToReturn);
        }

        public Task<LoginResponseDto> VerifyDeviceAsync(VerifyDeviceRequestDto request, string? existingDeviceToken, string? ipAddress, CancellationToken cancellationToken)
        {
            if (VerifyDeviceException is not null) throw VerifyDeviceException;
            return Task.FromResult(VerifyDeviceResultToReturn!);
        }
    }
    private sealed class TestApiFactory : WebApplicationFactory<Program>
    {
        private readonly StubAuthService _authService;
        private readonly SqliteConnection _connection = new("DataSource=:memory:");

        public TestApiFactory(StubAuthService authService)
        {
            _authService = authService;
        }

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

                services.RemoveAll(typeof(IAuthService));
                services.AddScoped<IAuthService>(_ => _authService);

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

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);
            if (disposing)
            {
                _connection.Dispose();
            }
        }
    }
    private static async Task<string> SeedUserAndGenerateTokenAsync(AppDbContext db, Guid userId, Domain.Enums.UserRole role)
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = JwtKey,
            ["Jwt:Issuer"] = JwtIssuer,
            ["Jwt:Audience"] = JwtAudience,
        })
        .Build();

        var provider = new Infrastructure.Providers.JwtTokenProvider(config);
        var user = new Domain.Entities.User
        {
            Id = userId,
            Email = $"test.{userId:N}@flashid.local",
            PhoneNumber = "0820000000",
            PasswordHash = "unused", // NOSONAR
            PasswordSet = true,
            IsDeleted = false,
            IsEmailVerified = true,
            Role = role,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        db.DomainUsers.Add(user);
        await db.SaveChangesAsync();
        return provider.GenerateToken(user).Token;
    }
    [Fact]
    public async Task Login_Success_SetsCookiesAndReturnsOk()
    {
        var authService = new StubAuthService
        {
            LoginResultToReturn = new LoginResponseDto
            {
                Token = "some-jwt-token", // NOSONAR
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                UserId = Guid.NewGuid(),
                Role = "Citizen",
                RequiresDeviceVerification = false,
            },
        };
        await using var factory = new TestApiFactory(authService);
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new LoginRequestDto { Email = "citizen@flashid.local", Password = "Password123!" }, // NOSONAR
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(response.Headers.TryGetValues("Set-Cookie", out var cookies));
        Assert.Contains(cookies!, c => c.StartsWith("access_token="));
        Assert.Contains(cookies!, c => c.StartsWith("csrf_token="));
    }

    [Fact]
    public async Task Login_RequiresDeviceVerification_ReturnsOkWithoutCookies()
    {
        var authService = new StubAuthService
        {
            LoginResultToReturn = new LoginResponseDto
            {
                Token = string.Empty,
                RequiresDeviceVerification = true,
                DeviceVerificationId = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Role = "Citizen",
            },
        };
        await using var factory = new TestApiFactory(authService);
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new LoginRequestDto { Email = "citizen@flashid.local", Password = "Password123!" }, // NOSONAR
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<LoginResponseDto>(JsonOptions, TestContext.Current.CancellationToken);
        Assert.NotNull(body);
        Assert.True(body.RequiresDeviceVerification);
        response.Headers.TryGetValues("Set-Cookie", out var cookies);
        Assert.Null(cookies);
    }

    [Fact]
    public async Task Login_MissingToken_ReturnsInternalServerError()
    {
        var authService = new StubAuthService
        {
            LoginResultToReturn = new LoginResponseDto
            {
                Token = string.Empty,
                RequiresDeviceVerification = false,
                UserId = Guid.NewGuid(),
                Role = "Citizen",
            },
        };
        await using var factory = new TestApiFactory(authService);
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new LoginRequestDto { Email = "citizen@flashid.local", Password = "Password123!" }, // NOSONAR
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
    }

    [Fact]
    public async Task Login_EmailNotVerified_ReturnsForbiddenWithCode()
    {
        var authService = new StubAuthService
        {
            LoginException = new EmailNotVerifiedException("citizen@flashid.local"),
        };
        await using var factory = new TestApiFactory(authService);
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new LoginRequestDto { Email = "citizen@flashid.local", Password = "Password123!" }, // NOSONAR
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken);
        Assert.Equal("EMAIL_NOT_VERIFIED", body.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Login_InvalidCredentials_ReturnsUnauthorized()
    {
        var authService = new StubAuthService
        {
            LoginException = new UnauthorizedAccessException("Invalid email or password."),
        };
        await using var factory = new TestApiFactory(authService);
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new LoginRequestDto { Email = "citizen@flashid.local", Password = "wrong" }, // NOSONAR
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_UnexpectedException_ReturnsInternalServerError()
    {
        var authService = new StubAuthService
        {
            LoginException = new InvalidOperationException("boom"),
        };
        await using var factory = new TestApiFactory(authService);
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new LoginRequestDto { Email = "citizen@flashid.local", Password = "Password123!" }, // NOSONAR
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
    }
    [Fact]
    public async Task VerifyDevice_Success_SetsCookiesAndReturnsOk()
    {
        var authService = new StubAuthService
        {
            VerifyDeviceResultToReturn = new LoginResponseDto
            {
                Token = "some-jwt-token", // NOSONAR
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                UserId = Guid.NewGuid(),
                Role = "Citizen",
                DeviceToken = "some-device-token", // NOSONAR
            },
        };
        await using var factory = new TestApiFactory(authService);
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/verify-device",
            new VerifyDeviceRequestDto
            {
                DeviceVerificationId = Guid.NewGuid(),
                Otp = "123456",
                DeviceType = DeviceType.Desktop,
                OperatingSystem = "Windows",
                Browser = "Chrome",
            },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(response.Headers.TryGetValues("Set-Cookie", out var cookies));
        Assert.Contains(cookies!, c => c.StartsWith("access_token="));
        Assert.Contains(cookies!, c => c.StartsWith("flashid_device="));
    }
    [Fact]
    public async Task VerifyDevice_InvalidOtp_ReturnsUnauthorized()
    {
        var authService = new StubAuthService
        {
            VerifyDeviceException = new UnauthorizedAccessException("Invalid or expired code."),
        };
        await using var factory = new TestApiFactory(authService);
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/verify-device",
            new VerifyDeviceRequestDto
            {
                DeviceVerificationId = Guid.NewGuid(),
                Otp = "000000",
                DeviceType = DeviceType.Desktop,
                OperatingSystem = "Windows",
                Browser = "Chrome",
            },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task VerifyDevice_UnexpectedException_ReturnsInternalServerError()
    {
        var authService = new StubAuthService
        {
            VerifyDeviceException = new InvalidOperationException("boom"),
        };
        await using var factory = new TestApiFactory(authService);
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/verify-device",
            new VerifyDeviceRequestDto
            {
                DeviceVerificationId = Guid.NewGuid(),
                Otp = "123456",
                DeviceType = DeviceType.Desktop,
                OperatingSystem = "Windows",
                Browser = "Chrome",
            },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
    }

    [Fact]
    public async Task Logout_Authenticated_ReturnsOkAndClearsCookies()
    {
        var authService = new StubAuthService();
        await using var factory = new TestApiFactory(authService);
        var db = await factory.CreateInitializedContextAsync();
        var client = factory.CreateClient();
        var userId = Guid.NewGuid();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await SeedUserAndGenerateTokenAsync(db, userId, Domain.Enums.UserRole.Citizen));
        var response = await client.PostAsync("/api/auth/logout", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(response.Headers.TryGetValues("Set-Cookie", out var cookies));
        Assert.Contains(cookies!, c => c.StartsWith("access_token=") && c.Contains("expires="));
        Assert.Contains(cookies!, c => c.StartsWith("csrf_token=") && c.Contains("expires="));
    }

    [Fact]
    public async Task Logout_Unauthenticated_ReturnsUnauthorized()
    {
        var authService = new StubAuthService();
        await using var factory = new TestApiFactory(authService);
        var client = factory.CreateClient();

        var response = await client.PostAsync("/api/auth/logout", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Me_Authenticated_ReturnsProfile()
    {
        var userId = Guid.NewGuid();
        var authService = new StubAuthService
        {
            CurrentUserToReturn = new UserProfileDto
            {
                UserId = userId,
                Email = "citizen@flashid.local",
                Role = "Citizen",
            },
        };
        await using var factory = new TestApiFactory(authService);
        var db = await factory.CreateInitializedContextAsync();
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await SeedUserAndGenerateTokenAsync(db, userId, Domain.Enums.UserRole.Citizen));

        var response = await client.GetAsync("/api/auth/me", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<UserProfileDto>(JsonOptions, TestContext.Current.CancellationToken);
        Assert.NotNull(body);
        Assert.Equal(userId, body.UserId);
    }

    [Fact]
    public async Task Me_UserNotFound_ReturnsNotFound()
    {
        var userId = Guid.NewGuid();
        var authService = new StubAuthService
        {
            CurrentUserToReturn = null,
        };
        await using var factory = new TestApiFactory(authService);
        var db = await factory.CreateInitializedContextAsync();
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await SeedUserAndGenerateTokenAsync(db, userId, Domain.Enums.UserRole.Citizen));

        var response = await client.GetAsync("/api/auth/me", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Me_Unauthenticated_ReturnsUnauthorized()
    {
        var authService = new StubAuthService();
        await using var factory = new TestApiFactory(authService);
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/auth/me", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
