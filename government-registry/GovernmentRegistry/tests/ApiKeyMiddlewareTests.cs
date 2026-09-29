using Infrastructure.Middleware;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Text;

namespace tests;

public class ApiKeyMiddlewareTests
{
    private const string ApiKeyHeaderName = "X-API-KEY";
    private const string ConfiguredKey = "correct-test-key";

    private static IConfiguration CreateConfiguration(string? apiKey = ConfiguredKey)
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    ["Security:ApiKeyGov"] = apiKey,
                }
            )
            .Build();
    }

    private static HttpContext CreateHttpContext(string? suppliedApiKey)
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        if (suppliedApiKey is not null)
        {
            context.Request.Headers[ApiKeyHeaderName] = suppliedApiKey;
        }

        return context;
    }

    [Fact]
    public async Task Invoke_MissingApiKeyHeader_Returns401AndDoesNotCallNext()
    {
        var nextCalled = false;
        RequestDelegate next = _ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        };

        var middleware = new ApiKeyMiddleware(next, CreateConfiguration());
        var context = CreateHttpContext(suppliedApiKey: null);

        await middleware.Invoke(context);

        Assert.Equal(401, context.Response.StatusCode);
        Assert.False(nextCalled);
    }

    [Fact]
    public async Task Invoke_InvalidApiKey_Returns401AndDoesNotCallNext()
    {
        var nextCalled = false;
        RequestDelegate next = _ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        };

        var middleware = new ApiKeyMiddleware(next, CreateConfiguration());
        var context = CreateHttpContext(suppliedApiKey: "wrong-key");

        await middleware.Invoke(context);

        Assert.Equal(401, context.Response.StatusCode);
        Assert.False(nextCalled);
    }

    [Fact]
    public async Task Invoke_ValidApiKey_CallsNext()
    {
        var nextCalled = false;
        RequestDelegate next = _ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        };

        var middleware = new ApiKeyMiddleware(next, CreateConfiguration());
        var context = CreateHttpContext(suppliedApiKey: ConfiguredKey);

        await middleware.Invoke(context);

        Assert.True(nextCalled);
    }

    [Fact]
    public async Task Invoke_ApiKeyNotConfigured_ThrowsInvalidOperationException()
    {
        RequestDelegate next = _ => Task.CompletedTask;

        var middleware = new ApiKeyMiddleware(next, CreateConfiguration(apiKey: null));
        var context = CreateHttpContext(suppliedApiKey: ConfiguredKey);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => middleware.Invoke(context));
    }
}