using System.Buffers.Text;
using System.Security.Cryptography;

namespace Presentation.Security;

public static class AuthCookies
{
    public const string AccessTokenCookieName = "access_token";
    public const string RefreshTokenCookieName = "refresh_token";
    public const string CsrfTokenCookieName = "csrf_token";

    public static void AppendSession(HttpResponse response, IHostEnvironment environment, string accessToken,
        DateTimeOffset? accessExpires, string? refreshToken, DateTimeOffset? refreshExpires)
    {
        response.Cookies.Append(AccessTokenCookieName, accessToken, CreateOptions(environment, accessExpires));

        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            response.Cookies.Append(RefreshTokenCookieName, refreshToken, CreateOptions(environment, refreshExpires));
        }

        AppendCsrfToken(response, environment, refreshExpires ?? accessExpires);
    }

    public static void DeleteAll(HttpResponse response, IHostEnvironment environment)
    {
        var options = new CookieOptions
        {
            HttpOnly = true,
            Secure = !environment.IsDevelopment(),
            SameSite = SameSiteMode.Lax,
            Path = "/",
        };

        response.Cookies.Delete(AccessTokenCookieName, options);
        response.Cookies.Delete(RefreshTokenCookieName, options);
        response.Cookies.Delete(CsrfTokenCookieName, options);
    }

    private static CookieOptions CreateOptions(IHostEnvironment environment, DateTimeOffset? expires) => new()
    {
        HttpOnly = true,
        Secure = !environment.IsDevelopment(),
        SameSite = SameSiteMode.Lax,
        Path = "/",
        Expires = expires,
        IsEssential = true,
    };

    private static void AppendCsrfToken(HttpResponse response, IHostEnvironment environment, DateTimeOffset? expires)
    {
        var csrfToken = Base64Url.EncodeToString(RandomNumberGenerator.GetBytes(32));

        response.Cookies.Append(CsrfTokenCookieName, csrfToken, new CookieOptions
        {
            HttpOnly = false,
            Secure = !environment.IsDevelopment(),
            SameSite = SameSiteMode.Lax,
            Path = "/",
            Expires = expires,
            IsEssential = true,
        });
    }
}
