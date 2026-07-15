using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Text;
using System.Security.Cryptography;

namespace Infrastructure.Middleware;

public class ApiKeyMiddleware
{
    private const string ApiKeyHeaderName = "X-API-KEY";
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;
    
    public ApiKeyMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        _next = next;
        _configuration = configuration;
    }

    public async Task Invoke(HttpContext context)
    {
        if (!context.Request.Headers.TryGetValue(ApiKeyHeaderName, out var apiKey))
        {
            context.Response.StatusCode = 401;
            await  context.Response.WriteAsync("API Key not found.");
            return;
        }
        
        var configuredKey = _configuration["Security:ApiKeyGov"];

        if (string.IsNullOrWhiteSpace(configuredKey))
        {
            throw new InvalidOperationException("Government Registry API key is not configured.");
        }
        
        var suppliedKeyBytes = Encoding.UTF8.GetBytes(apiKey.ToString());
        
        var configuredKeyBytes = Encoding.UTF8.GetBytes(configuredKey);
        
        var isValid = suppliedKeyBytes.Length == configuredKeyBytes.Length && CryptographicOperations.FixedTimeEquals(suppliedKeyBytes, configuredKeyBytes);

        if (!isValid)
        {
            await context.Response.WriteAsync("Invalid API Key.");
            return;
        }
        
        await _next(context);
    }
    
}