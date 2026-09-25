namespace Presentation.Security;

public static class AuthCookies
{
    public const string AccessTokenCookieName = "access_token";

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
    }
}
