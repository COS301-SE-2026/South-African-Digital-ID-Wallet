using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Auth.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Application.Features.Auth.Exceptions;

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

    public AuthController(
        IAuthService authService,
        ILogger<AuthController> logger,
        IHostEnvironment environment)
    {
        _authService = authService;
        _logger = logger;
        _environment = environment;
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

            if (result.RequiresDeviceVerification)
            {
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

            var isNativeClient = string.Equals(client, "mobile", StringComparison.Ordinal);
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

            var isNativeClient = string.Equals(client, "mobile", StringComparison.Ordinal) && !Request.Headers.ContainsKey("Origin");
            if (!isNativeClient)
            {
                result.Token = null;
                result.DeviceToken = null;
            }
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
}
