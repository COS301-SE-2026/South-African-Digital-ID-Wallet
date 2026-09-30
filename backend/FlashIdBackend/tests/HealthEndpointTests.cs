using System.Net;
using Application.Common.Interfaces.ProviderInterfaces;
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

public class HealthEndpointTests
{
    private const string JwtKey = "integration-test-secret-key-which-is-long-enough"; // NOSONAR

    private sealed class BrokenSigningProvider : ICredentialSigningProvider
    {
        public Task<CredentialSigningKey> GetActiveKeyAsync(CancellationToken cancellationToken) =>
            Task.FromException<CredentialSigningKey>(new InvalidOperationException("Credential signing key id is not configured."));

        public Task<byte[]> SignAsync(string keyId, byte[] signingInput, CancellationToken cancellationToken) =>
            throw new NotImplementedException("Not exercised by these tests.");
    }

    private sealed class TestApiFactory(ICredentialSigningProvider signingProvider) : WebApplicationFactory<Program>
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
                    ["Jwt:Issuer"] = "FlashId",
                    ["Jwt:Audience"] = "FlashIdWeb",
                });
            });

            builder.ConfigureServices(services =>
            {
                _connection.Open();
                services.AddDbContext<AppDbContext>(options => options.UseSqlite(_connection));
                services.RemoveAll(typeof(IHostedService));
                services.RemoveAll<ICredentialSigningProvider>();
                services.AddSingleton(signingProvider);
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

    [Fact]
    public async Task Health_EvenWhenSigningKeyIsBroken_ReturnsHealthyWithoutAuthentication()
    {
        await using var factory = new TestApiFactory(new BrokenSigningProvider());
        var client = factory.CreateClient();

        var response = await client.GetAsync("/health", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Healthy", await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task HealthReady_WhenSigningKeyLoads_ReturnsHealthy()
    {
        using var signingProvider = new TestSigningProvider();
        await using var factory = new TestApiFactory(signingProvider);
        var client = factory.CreateClient();

        var response = await client.GetAsync("/health/ready", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Healthy", await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task HealthReady_WhenSigningKeyCannotLoad_Returns503WithoutLeakingDetail()
    {
        await using var factory = new TestApiFactory(new BrokenSigningProvider());
        var client = factory.CreateClient();

        var response = await client.GetAsync("/health/ready", TestContext.Current.CancellationToken);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Equal("Unhealthy", body);
        Assert.DoesNotContain("not configured", body, StringComparison.OrdinalIgnoreCase);
    }
}