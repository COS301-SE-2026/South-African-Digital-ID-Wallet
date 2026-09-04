using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Auth.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Application.Features.Auth.Exceptions;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.DataProtection;

namespace Presentation.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly IHostEnvironment _environment;

    private const string DeviceCookieName = "flashid_device";
    private const string DeviceHeaderName = "X-Device-Token";
    private readonly IDataProtector _deviceVerificationProtector;

    public AuthController(
        IAuthService authService,
        ILogger<AuthController> logger,
        IHostEnvironment environment,
        IDataProtectionProvider dataProtectionProvider)
    {
        _authService = authService;
        _logger = logger;
        _environment = environment;
        _deviceVerificationProtector = dataProtectionProvider.CreateProtector("FlashID.DeviceVerification");
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null) return Unauthorized(new { error = "Invalid token." });

            var userId = Guid.Parse(userIdClaim);
            var profile = await _authService.GetCurrentUserAsync(userId);

            if (profile == null) return NotFound(new { error = "User not found." });
            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in Me endpoint");
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    // Login is anonymous — no [Authorize] needed because the user does not have a token yet.
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request, [FromHeader(Name = "X-Client")] string? client, CancellationToken cancellationToken)
    {
        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var deviceToken = ReadDeviceToken();
            var result = await _authService.LoginAsync(request, deviceToken, ipAddress, cancellationToken);


            if (result.RequiresDeviceVerification && result.DeviceVerificationId.HasValue)
            {
                var protectedVerificationId = _deviceVerificationProtector.Protect(result.DeviceVerificationId.Value.ToString());
                Response.Cookies.Append("flashid_device_verification", protectedVerificationId,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = !_environment.IsDevelopment(),
                    SameSite = _environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
                    Path = "/api/auth",
                    Expires = DateTimeOffset.UtcNow.AddMinutes(10),
                    IsEssential = true
                });

                result.Token = string.Empty;
                return Ok(result);
            }

            if (string.IsNullOrWhiteSpace(result.Token))
            {
                _logger.LogError("Login completed without an access token for {Email}", request.Email);
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = "The login could not be completed." });
            }

            // The token is set in an HttpOnly cookie so JavaScript cannot read it.
            // Secure = true in production forces HTTPS; in development HTTP is allowed.
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = !_environment.IsDevelopment(),
                SameSite = _environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
                Path = "/",
                Expires = result.ExpiresAt,
                IsEssential = true
            };

            Response.Cookies.Append("access_token", result.Token, cookieOptions);

            var isNativeClient = IsNativeClient(client);
            if (!isNativeClient)
            {
                result.Token = null;
            }

            return Ok(result);
        }
        catch (EmailNotVerifiedException ex)
        {
            return StatusCode(403, new { error = ex.Message, code = "EMAIL_NOT_VERIFIED" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during login for {Email}", request.Email);

            if (_environment.IsDevelopment())
                return StatusCode(500, new { error = ex.Message, detail = ex.ToString() });

            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    [HttpPost("verify-device")]
    public async Task<IActionResult> VerifyDevice([FromBody] VerifyDeviceRequestDto request,
        [FromHeader(Name = "X-Client")] string? client,
        CancellationToken cancellationToken)
    {
        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var deviceToken = ReadDeviceToken();

            var result = await _authService.VerifyDeviceAsync(request, deviceToken, ipAddress, cancellationToken);

            if (string.IsNullOrWhiteSpace(result.Token))
            {
                _logger.LogError("Device verification completed without an access token.");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { error = "The login could not be completed." });
            }

            var accessTokenOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = !_environment.IsDevelopment(),
                SameSite = _environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
                Path = "/",
                Expires = result.ExpiresAt,
                IsEssential = true
            };
            Response.Cookies.Append("access_token", result.Token, accessTokenOptions);

            if (!string.IsNullOrWhiteSpace(result.DeviceToken))
            {
                var deviceCookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = !_environment.IsDevelopment(),
                    SameSite = _environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
                    Path = "/",
                    Expires = DateTimeOffset.UtcNow.AddMonths(4),
                    IsEssential = true
                };

                Response.Cookies.Append("flashid_device", result.DeviceToken, deviceCookieOptions);
            }

            var isNativeClient = IsNativeClient(client);
            if (!isNativeClient)
            {
                result.Token = null;
                result.DeviceToken = null;
            }
            Response.Cookies.Delete(
    "flashid_device_verification",
    new CookieOptions
    {
        Path = "/api/auth",
        Secure = !_environment.IsDevelopment(),
        SameSite = _environment.IsDevelopment()
            ? SameSiteMode.Lax
            : SameSiteMode.None
    });
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
        catch (Exception ex)
        {

            _logger.LogError(ex, "Unexpected error during device verification.");
            if (_environment.IsDevelopment())
            {
                return StatusCode(500, new { error = ex.Message, detail = ex.ToString() });
            }
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    [HttpPost("resend-device-verification")]
    [EnableRateLimiting("resend-device-verification")]
    public async Task<IActionResult> ResendDeviceVerification(
        [FromBody] ResendDeviceVerificationRequestDto request, CancellationToken cancellationToken
    )
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.DeviceVerificationId))
            {
                return BadRequest(
                    new { error = "Device verification ID is required." });
            }

            if (!Guid.TryParse(request.DeviceVerificationId, out var deviceVerificationId))
            {
                return BadRequest(new
                {
                    error = "Invalid device verification ID."
                });
            }

            if (!Request.Cookies.TryGetValue(
        "flashid_device_verification",
        out var verificationCookie))
            {
                return Unauthorized(new
                {
                    error = "Device verification session is missing."
                });
            }

            Guid cookieVerificationId;

            try
            {
                var unprotectedValue =
                    _deviceVerificationProtector.Unprotect(
                        verificationCookie);

                if (!Guid.TryParse(
                        unprotectedValue,
                        out cookieVerificationId))
                {
                    return Unauthorized(new
                    {
                        error = "Invalid device verification session."
                    });
                }
            }
            catch
            {
                return Unauthorized(new
                {
                    error = "Invalid device verification session."
                });
            }

            if (cookieVerificationId != deviceVerificationId)
            {
                return Unauthorized(new
                {
                    error =
                        "Device verification session does not match this request."
                });
            }

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            await _authService.ResendDeviceVerificationOtpAsync(deviceVerificationId, ipAddress, cancellationToken);
            return Ok(new { message = "Verification code has been resent to your email." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during device verification OTP resend.");
            if (_environment.IsDevelopment())
                return StatusCode(500, new { error = ex.Message, detail = ex.ToString() });
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    // [Authorize] — must be authenticated (any role) to log out.
    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null) return Unauthorized(new { error = "Invalid token." });

            var userId = Guid.Parse(userIdClaim);
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var result = await _authService.LogoutAsync(userId, ipAddress);

            Response.Cookies.Delete("access_token", new CookieOptions
            {
                Path = "/",
                Secure = !_environment.IsDevelopment(),
                SameSite = _environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during logout");
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }
    private string? ReadDeviceToken()
    {
        if (Request.Headers.TryGetValue(DeviceHeaderName, out var header)
            && !string.IsNullOrWhiteSpace(header))
        {
            return header.ToString();
        }

        Request.Cookies.TryGetValue(DeviceCookieName, out var cookie);
        return cookie;
    }
    private bool IsNativeClient(string? client)
    {
        if (!string.Equals(client, "mobile", StringComparison.Ordinal))
        {
            return false;
        }
        return !Request.Headers.ContainsKey("Origin") && !Request.Headers.ContainsKey("Sec-Fetch-Site");
    }
}
