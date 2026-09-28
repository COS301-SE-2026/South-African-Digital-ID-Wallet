using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
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

public class CitizensControllerTests
{
    private const string JwtKey = "integration-test-secret-key-which-is-long-enough"; // NOSONAR
    private const string JwtIssuer = "FlashId";
    private const string JwtAudience = "FlashIdWeb";

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
                services.RemoveAll(typeof(IHostedService));
            });
        }

        public async Task InitializeDatabaseAsync()
        {
            using var scope = Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await db.Database.EnsureCreatedAsync();
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
    [InlineData("citizen@example.com", "password123!", "Password must contain at least one uppercase letter.")]
    [InlineData("not-an-email", "P@ssword123", "Enter a valid email address, for example name@example.com.")]
    public async Task Register_WithInvalidInput_Returns400WithTheSpecificGuidanceMessage(string email, string password, string expectedMessage)
    {
        await using var factory = new TestApiFactory();
        await factory.InitializeDatabaseAsync();
        var client = factory.CreateClient();
        var ct = TestContext.Current.CancellationToken;

        var response = await client.PostAsJsonAsync("/api/citizens/register", new { email, password }, ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync(ct);
        using var json = JsonDocument.Parse(body);
        Assert.Equal(expectedMessage, json.RootElement.GetProperty("error").GetString());
    }
}