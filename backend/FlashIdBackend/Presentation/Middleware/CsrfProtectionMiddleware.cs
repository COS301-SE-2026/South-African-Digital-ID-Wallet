using System.Security.Cryptography;
using System.Text;

namespace Presentation.Middleware;

public class CsrfProtectionMiddleware
{
    private const string CookieName = "csrf_token";
    private const string HeaderName = "X-CSRF-Token";

    private static readonly HashSet<string> ProtectedMethods = new(StringComparer.OrdinalIgnoreCase)
    {
        "POST", "PUT", "PATCH", "DELETE"
    };

    private readonly RequestDelegate _next;

    public CsrfProtectionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var requiresCheck = ProtectedMethods.Contains(context.Request.Method)
            && context.Request.Cookies.ContainsKey("access_token");

        if (requiresCheck && !IsValidCsrfToken(context))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new { error = "CSRF token missing or invalid." });
            return;
        }

        await _next(context);
    }

    private static bool IsValidCsrfToken(HttpContext context)
    {
        if (!context.Request.Cookies.TryGetValue(CookieName, out var cookieToken)
            || string.IsNullOrEmpty(cookieToken))
        {
            return false;
        }

        var headerToken = context.Request.Headers[HeaderName].ToString();
        if (string.IsNullOrEmpty(headerToken))
        {
            return false;
        }

        var cookieBytes = Encoding.UTF8.GetBytes(cookieToken);
        var headerBytes = Encoding.UTF8.GetBytes(headerToken);

        if (cookieBytes.Length != headerBytes.Length)
        {
            return false;
        }

        return CryptographicOperations.FixedTimeEquals(cookieBytes, headerBytes);
    }
}