using System.Net;
using System.Net.Http.Json;
using Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;

namespace tests;

public class RateLimitingTests
{
    private const string JwtKey = "integration-test-secret-key-which-is-long-enough"; // NOSONAR

    private sealed class TestApiFactory : WebApplicationFactory<Program>
    {
        private readonly SqliteConnection _connection = new("DataSource=:memory:");

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");

            // UseSetting is applied before Program.cs runs, so the early rateLimitsEnabled read sees it
            builder.UseSetting("RateLimiting:Enabled", "true");

            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["Jwt:Key"] = JwtKey,
                    ["Jwt:Issuer"] = "FlashId",
                    ["Jwt:Audience"] = "FlashIdWeb",
                });
            });

            builder.ConfigureServices(services =>
            {
                _connection.Open();
                services.AddDbContext<AppDbContext>(options => options.UseSqlite(_connection));
                services.RemoveAll(typeof(IHostedService));
            });
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

    [Theory]
    [InlineData("/api/citizens/register", 5)]
    [InlineData("/api/citizens/resend-otp", 3)]
    [InlineData("/api/auth/login", 10)]
    public async Task AbuseProneEndpoint_PastItsLimit_Returns429(string path, int permitLimit)
    {
        // fresh factory per case so each limiter window starts empty
        await using var factory = new TestApiFactory();
        var client = factory.CreateClient();

        // requests inside the limit reach the endpoint, whatever it answers
        for (var i = 0; i < permitLimit; i++)
        {
            var allowed = await client.PostAsJsonAsync(path, new { }, TestContext.Current.CancellationToken);
            Assert.NotEqual(HttpStatusCode.TooManyRequests, allowed.StatusCode);
        }

        var rejected = await client.PostAsJsonAsync(path, new { }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.TooManyRequests, rejected.StatusCode);
    }

    [Fact]
    public async Task Refresh_IsLimitedPerRefreshTokenRatherThanPerSharedIp()
    {
        await using var factory = new TestApiFactory();
        var client = factory.CreateClient();

        Task<HttpResponseMessage> RefreshWith(string refreshToken)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
            request.Headers.Add("Cookie", $"refresh_token={refreshToken}");
            return client.SendAsync(request, TestContext.Current.CancellationToken);
        }

        for (var i = 0; i < 60; i++)
        {
            Assert.NotEqual(HttpStatusCode.TooManyRequests, (await RefreshWith("session-a")).StatusCode);
        }

        Assert.Equal(HttpStatusCode.TooManyRequests, (await RefreshWith("session-a")).StatusCode);
        Assert.NotEqual(HttpStatusCode.TooManyRequests, (await RefreshWith("session-b")).StatusCode);
    }

    [Fact]
    public async Task Refresh_WithADifferentRandomTokenEachTime_IsStillCappedPerIp()
    {
        await using var factory = new TestApiFactory();
        var client = factory.CreateClient();

        Task<HttpResponseMessage> RefreshWithRandomToken()
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
            request.Headers.Add("Cookie", $"refresh_token={Guid.NewGuid():N}");
            return client.SendAsync(request, TestContext.Current.CancellationToken);
        }

        for (var i = 0; i < 300; i++)
        {
            Assert.NotEqual(HttpStatusCode.TooManyRequests, (await RefreshWithRandomToken()).StatusCode);
        }

        Assert.Equal(HttpStatusCode.TooManyRequests, (await RefreshWithRandomToken()).StatusCode);
    }
}
