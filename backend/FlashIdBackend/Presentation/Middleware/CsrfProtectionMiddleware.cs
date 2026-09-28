using System.Security.Cryptography;
using System.Text;
using Presentation.Security;

namespace Presentation.Middleware;

public class CsrfProtectionMiddleware
{
    private const string HeaderName = "X-CSRF-Token";

    private static readonly HashSet<string> ProtectedMethods = new(StringComparer.OrdinalIgnoreCase)
    {
        "POST", "PUT", "PATCH", "DELETE"
    };

    private static readonly HashSet<string> ExemptPaths = new(StringComparer.OrdinalIgnoreCase)
    {
        "/api/auth/login",
        "/api/auth/verify-device",
        "/api/auth/resend-device-verification",
    };

    private readonly RequestDelegate _next;

    public CsrfProtectionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!RequiresCheck(context))
        {
            await _next(context);
            return;
        }

        if (!context.Request.Cookies.TryGetValue(AuthCookies.CsrfTokenCookieName, out var cookieToken)
            || string.IsNullOrEmpty(cookieToken))
        {
            await RejectAsync(context, StatusCodes.Status401Unauthorized, "CSRF token missing. Please sign in again.");
            return;
        }

        if (!HeaderMatchesCookie(context, cookieToken))
        {
            await RejectAsync(context, StatusCodes.Status403Forbidden, "CSRF token missing or invalid.");
            return;
        }

        await _next(context);
    }

    private static bool RequiresCheck(HttpContext context)
    {
        if (!ProtectedMethods.Contains(context.Request.Method))
        {
            return false;
        }

        if (!context.Request.Cookies.ContainsKey(AuthCookies.AccessTokenCookieName))
        {
            return false;
        }

        if (context.Request.Headers.Authorization.ToString().StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var path = context.Request.Path.Value?.TrimEnd('/') ?? string.Empty;
        return !ExemptPaths.Contains(path);
    }

    private static bool HeaderMatchesCookie(HttpContext context, string cookieToken)
    {
        var headerToken = context.Request.Headers[HeaderName].ToString();
        if (string.IsNullOrEmpty(headerToken))
        {
            return false;
        }

        var cookieBytes = Encoding.UTF8.GetBytes(cookieToken);
        var headerBytes = Encoding.UTF8.GetBytes(headerToken);

        return cookieBytes.Length == headerBytes.Length
            && CryptographicOperations.FixedTimeEquals(cookieBytes, headerBytes);
    }

    private static async Task RejectAsync(HttpContext context, int statusCode, string error)
    {
        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsJsonAsync(new { error }, context.RequestAborted);
    }
}