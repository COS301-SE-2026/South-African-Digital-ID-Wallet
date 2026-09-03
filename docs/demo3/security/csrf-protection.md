# CSRF Protection

## What CSRF is and why we needed this

Cross-Site Request Forgery is when a malicious site gets a logged-in user's browser to fire off a request to our API using their existing session, without them knowing about it.

The reason this works: browsers attach cookies based on the target domain, not based on where the request came from. So if `access_token` lives in a cookie, any page the user has open in another tab, including a dodgy one, can trigger a request to our API and the browser will still send that cookie along. Doesn't matter that the request originated from some random site.

### Why we were actually exposed

Our `access_token` cookie is `HttpOnly` (see `Login` and `VerifyDevice` in `AuthController.cs`), which is good and correct, but it's solving a different problem. `HttpOnly` stops JavaScript from reading the token, which protects against XSS. It does nothing to stop the browser from sending the cookie automatically on a cross-site request, which is the CSRF problem.

Two different attacks, two different fixes:

| Threat | Defense | Did we have it? |
|---|---|---|
| XSS (script reads the JWT) | HttpOnly cookie | Yes |
| CSRF (forged request uses the JWT cookie) | SameSite + CSRF token | Only partial |

Our `SameSite` setting on `access_token` changes per environment:

- Dev: `SameSite=Lax`, which already blocks most cross-site POST/PUT/DELETE attempts.
- Prod: `SameSite=None`, because the frontend and API likely sit on different origins in prod and `None` is required for the cookie to even get sent cross-origin. But `None` also means zero built-in CSRF protection.

So in production specifically, before this change, we were wide open. Any malicious page could've silently triggered a credential revoke, an account change, a logout, just by getting a logged-in user to load it.

## The fix: double-submit cookie

The idea is simple. An attacker's page can make the browser send our cookies automatically, but it can't read the value of a cookie it doesn't own, and it can't fake a header the way it fakes a cookie.

So now we set two cookies at login:

1. `access_token`, same as before, HttpOnly, browser sends it automatically.
2. `csrf_token`, new, random, NOT HttpOnly, so our own frontend JS can actually read it.

On every state-changing request, the frontend grabs `csrf_token` out of `document.cookie` and sticks it on as a header, `X-CSRF-Token`. The backend then checks whether the header matches the cookie.

- Real request from our frontend: JS reads the cookie fine (same origin), attaches the matching header. Passes.
- Forged request from some other site: the browser still sends the `csrf_token` cookie automatically, cookies don't care about CORS, but the attacker's JS can't read that cookie's value because it's running on a different origin, browsers enforce same-origin restrictions on `document.cookie`. Without knowing the value, the attacker can't set a matching `X-CSRF-Token` header. Check fails, request is rejected with `403 Forbidden`.

That's the "double submit" part, the same value has to show up twice, once as a cookie (automatic) and once as a header (manual), and only code running on our actual domain can make both match.

## What we actually built

### 1. CsrfProtectionMiddleware.cs

`backend/FlashIdBackend/Presentation/Middleware/CsrfProtectionMiddleware.cs`

Runs on every request but only actually checks anything when:

- The method is POST, PUT, PATCH, or DELETE (GETs don't change state so there's nothing to protect).
- There's an `access_token` cookie present (no point checking on login itself, there's no session yet).

If both hold, it compares `csrf_token` against `X-CSRF-Token` using `CryptographicOperations.FixedTimeEquals` instead of a plain string comparison. Reason for that: a normal `==` bails out as soon as it hits a mismatched character, so in theory someone could time the responses and slowly guess the token one byte at a time. Constant-time comparison takes the same amount of time no matter where the mismatch is, so that timing trick doesn't work.

Fails the check, gets a 403, never reaches the controller.

It's wired into `Program.cs` here:
UseCors -> UseRateLimiter-> UseMiddleware<CsrfProtectionMiddleware> -> UseAuthentication-> UseAuthorization
After CORS so even a 403 comes back with proper CORS headers instead of the browser just showing a confusing CORS error. Before authentication so a forged request gets bounced immediately instead of wasting time on JWT validation and a DB lookup first.

### 2. Changes to AuthController.cs

Added a helper, `SetCsrfCookie`, that generates a random 32-byte token and sets it as a cookie. Only difference from `access_token`'s cookie settings is `HttpOnly = false`, on purpose, since the whole point is that our frontend JS needs to read it.

Gets called right after `access_token` is set, in both `Login` and `VerifyDevice`. Gets cleared in `Logout`, alongside `access_token`.

### 3. Changes to web/src/lib/api.ts

Added a request interceptor that pulls `csrf_token` out of `document.cookie` and, only for POST/PUT/PATCH/DELETE calls, sticks it on as `X-CSRF-Token`. Happens automatically for every request going through the shared axios instance, so none of the individual service files needed touching.

## What this doesn't fix

- Mobile isn't affected either way. Mobile never gets `access_token` as a cookie in the first place, it comes back in the JSON body and gets attached manually as an Authorization header (see `IsNativeClient`). No cookie means the middleware skips it entirely, which is fine since mobile was never exposed to this in the first place.
- This is not an XSS fix. If someone finds a way to run JS on our actual domain, they can read `csrf_token` directly and this protection is worthless. That's a separate problem, and it's exactly why we still want `HttpOnly` on `access_token` even with CSRF protection in place.

## Testing

Three integration tests cover CsrfProtectionMiddleware, in `backend/FlashIdBackend/tests/CsrfProtectionMiddlewareTests.cs`, following the project's WebApplicationFactory-based integration test convention (as seen in CredentialControllerIntegrationTests.cs). All three pass against the real middleware pipeline, a real in-memory SQLite database, and (for the third test) a real JWT-authenticated request that reaches the controller and completes successfully:

1. State-changing request with an access_token cookie but no CSRF cookie or header: returns 403 Forbidden.
2. State-changing request with a csrf_token cookie but a mismatched X-CSRF-Token header: returns 403 Forbidden.
3. State-changing request with matching cookie and header values, plus a valid JWT: passes the CSRF check and completes normally.