# CSRF Protection

## What CSRF is and why we needed this

Cross-Site Request Forgery is when a malicious site gets a logged-in user's browser to fire off a request to our API using their existing session, without them knowing about it.

The reason this works:browsers attach cookies based on the target domain, not based on where the request came from. So if `access_token` lives in a cookie, any page the user has open in another tab, including a dodgy one, can trigger a request to us and the browser will still send that cookie along.

### Why we were actually exposed

Our `access_token` cookie is `HttpOnly`, which is good and correct, but it solves a different problem. `HttpOnly` stops JavaScript from reading the token, which protects against XSS. It does nothing to stop the browser from sending the cookie automatically on a cross-site request, which is the CSRF problem.

| Threat | Defense | Did we have it? |
|---|---|---|
| XSS (script reads the JWT) | HttpOnly cookie | Yes |
| CSRF (forged request uses the JWT cookie) | SameSite + CSRF token | Only partial |

Before this change, our `SameSite` setting changed per environment:

- Development: `SameSite=Lax`, which already blocks most cross-site POST/PUT/PATCH/DELETE attempts.
- Everywhere else: `SameSite=None`, which means the browser attaches the cookie to cross-site requests too, so there is no built-in CSRF protection at all.

So outside development, any malicious page could have silently triggered a credential revoke, an account change or a logout just by getting a logged-in user to load it.

`AuthCookies.cs` now sets `SameSite=Lax` on both `access_token` and `csrf_token` in every environment. This is safe because the browser only ever talks to our own origin (see below), and it gives us two layers: the browser won't send the cookies on cross-site POST/PUT/PATCH/DELETE requests at all, and if that is ever bypassed (an older browser, a misconfiguration), the CSRF token check still rejects the request.

### How the browser reaches the API

The browser never calls the backend directly. Every call goes to the Next.js app on the same origin as the page, and `web/src/app/api/[...path]/route.ts` forwards it to the backend. That means both cookies are set on the web app's origin, and our own frontend JS can read `csrf_token` from `document.cookie`.

## The fix: double-submit cookie

An attacker's page can make the browser send our cookies automatically, but it can't read the value of a cookie on another origin, and it can't make the browser add a custom header with a value it doesn't know.

So every time we issue an access token, we set two cookies:

1. `access_token`: HttpOnly, sent automatically by the browser.
2. `csrf_token`: 32 random bytes, Base64Url-encoded, NOT HttpOnly, so our frontend JS can read it. Same `Secure`, `SameSite` and expiry as `access_token`, so the two always live and die together.

On every state-changing request, the frontend reads `csrf_token` from `document.cookie` and sends it as the `X-CSRF-Token` header. The backend checks that the header matches the cookie.

- Real request from our frontend: JS reads the cookie (same origin) and attaches the matching header. Passes.
- Forged request from another site: the browser still sends the `csrf_token` cookie, but the attacker's JS can't read its value, so it can't set a matching header. Rejected with `403 Forbidden`.

That's the "double submit" part: the same value has to show up twice, once as a cookie (automatic) and once as a header (manual), and only code running on our origin can make both match.

## What we actually built

### 1. CsrfProtectionMiddleware.cs

`backend/FlashIdBackend/Presentation/Middleware/CsrfProtectionMiddleware.cs`

Runs on every request, but only checks anything when all of these hold:

- The method is POST, PUT, PATCH or DELETE. GETs don't change state.
- There is an `access_token` cookie. No cookie means no browser session to hijack; this is also why mobile is unaffected.
- The path is not one of the anonymous auth endpoints: `/api/auth/login`, `/api/auth/verify-device`, `/api/auth/resend-device-verification`. A user with an expired session still has a stale `access_token` cookie, and we don't want that to block them from logging in again. These endpoints don't act on an existing session, so there is nothing to forge.

When it does check, there are two outcomes:

- `csrf_token` cookie missing: `401 Unauthorized` ("CSRF token missing. Please sign in again."). This happens for sessions created before this change existed, which have `access_token` but no `csrf_token`. The frontend's 401 handler in `api.ts` sends the user back to login, and logging in issues both cookies. A 403 here would leave the user stuck on a broken page.
- Cookie present but `X-CSRF-Token` missing or different: `403 Forbidden` ("CSRF token missing or invalid."). This is the actual forged-request case.

The comparison uses `CryptographicOperations.FixedTimeEquals` instead of `==`. A normal string comparison stops at the first mismatched character, so in theory someone could time responses and guess the token byte by byte. Constant-time comparison takes the same time wherever the mismatch is.

It's wired into `Program.cs` in this order:

`UseCors` -> `UseRateLimiter` -> `UseMiddleware<CsrfProtectionMiddleware>` -> `UseAuthentication` -> `UseAuthorization`

After CORS, so a rejection still comes back with proper CORS headers instead of a confusing CORS error. Before authentication, so a forged request gets bounced before any JWT validation or database lookup.

### 2. AuthCookies.cs

`backend/FlashIdBackend/Presentation/Security/AuthCookies.cs`

All auth cookie handling lives here instead of in `AuthController`:

- `AppendAccessToken` sets `access_token` and always issues a fresh `csrf_token` alongside it with the same expiry. Every place that issues an access token therefore gets a CSRF token automatically, with no chance of one code path forgetting.
- `DeleteAll` deletes both cookies. `AuthController.Logout` calls it, so logging out never leaves a stray `csrf_token` behind.

### 3. web/src/lib/api.ts

A request interceptor on the shared axios instance reads `csrf_token` from `document.cookie` and, for POST/PUT/PATCH/DELETE only, sets it as `X-CSRF-Token`. None of the individual service files needed touching.

## What this doesn't fix

- Mobile isn't affected either way. Mobile never gets `access_token` as a cookie; it comes back in the JSON body and is sent as an `Authorization` header. No cookie means the middleware skips the request, which is fine because a header can't be attached by another site.
- This is not an XSS fix. If someone can run JS on our own origin, they can read `csrf_token` directly and this protection is worthless. That's a separate problem, and it's exactly why `access_token` stays `HttpOnly`.

## Testing

### Middleware tests

`backend/FlashIdBackend/tests/CsrfProtectionMiddlewareTests.cs` runs against the real middleware pipeline and an in-memory SQLite database, using the project's `WebApplicationFactory` integration test setup:

1. POST with `access_token` but no `csrf_token` cookie: `401`, with the "CSRF token missing" message.
2. POST with mismatched `csrf_token` cookie and `X-CSRF-Token` header: `403`.
3. POST with `csrf_token` cookie but no header: `403`.
4. POST with matching cookie and header plus a valid JWT: passes the CSRF check and reaches the controller.
5. GET with `access_token` and no CSRF token: not checked.
6. POST with no `access_token` cookie: not checked.
7. POST to each of the three anonymous auth endpoints with a stale `access_token` and no CSRF token: not blocked (one theory, three cases).

### Auth controller tests

`backend/FlashIdBackend/tests/AuthControllerTests.cs` covers the cookie side: when device verification is required, neither `access_token` nor `csrf_token` is set.

### E2E

`web/e2e/test/credential-expiry.spec.ts` makes a real state-changing request as a gov admin with the `X-CSRF-Token` header taken from the `csrf_token` cookie. It fails with a clear message if the cookie is missing.