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
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var result = await _authService.LoginAsync(request, ipAddress);

            // The token is set in an HttpOnly cookie so JavaScript cannot read it.
            // Secure = true in production forces HTTPS; in development HTTP is allowed.
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = !_environment.IsDevelopment(),
                SameSite = _environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
                Path = "/",
                Expires = result.ExpiresAt,
            };

            Response.Cookies.Append("access_token", result.Token, cookieOptions);
            result.Token = string.Empty;

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
}
