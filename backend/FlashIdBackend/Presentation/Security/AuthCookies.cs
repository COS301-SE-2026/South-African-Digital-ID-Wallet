using System.Buffers.Text;
using System.Security.Cryptography;

namespace Presentation.Security;

public static class AuthCookies
{
    public const string AccessTokenCookieName = "access_token";
    public const string CsrfTokenCookieName = "csrf_token";

    public static void AppendAccessToken(HttpResponse response, IHostEnvironment environment, string token, DateTimeOffset? expires)
    {
        response.Cookies.Append(AccessTokenCookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = !environment.IsDevelopment(),
            SameSite = environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
            Path = "/",
            Expires = expires,
            IsEssential = true,
        });

        AppendCsrfToken(response, environment, expires);
    }
    public static void DeleteAll(HttpResponse response, IHostEnvironment environment)
    {
        var options = new CookieOptions
        {
            HttpOnly = true,
            Secure = !environment.IsDevelopment(),
            SameSite = environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
            Path = "/",
        };

        response.Cookies.Delete(AccessTokenCookieName, options);
        response.Cookies.Delete(CsrfTokenCookieName, options);
    }

    private static void AppendCsrfToken(HttpResponse response, IHostEnvironment environment, DateTimeOffset? expires)
    {
        var csrfToken = Base64Url.EncodeToString(RandomNumberGenerator.GetBytes(32));

        response.Cookies.Append(CsrfTokenCookieName, csrfToken, new CookieOptions
        {
            HttpOnly = false,
            Secure = !environment.IsDevelopment(),
            SameSite = environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
            Path = "/",
            Expires = expires,
            IsEssential = true,
        });
    }
}
