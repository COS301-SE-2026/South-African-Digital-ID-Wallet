using Application.Common.Interfaces;
using Application.Features.Auth.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace Presentation.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly IHostEnvironment _environment;
    private readonly Infrastructure.Data.AppDbContext _db;

    public AuthController(
        IAuthService authService,
        ILogger<AuthController> logger,
        IHostEnvironment environment,
        Infrastructure.Data.AppDbContext db
    )
    {
        _authService = authService;
        _logger = logger;
        _environment = environment;
        _db = db;
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

            var user = await _db.DomainUsers.FindAsync(userId);
            if (user == null) return NotFound(new { error = "User not found." });

            return Ok(new
            {
                userId = user.Id,
                email = user.Email,
                role = user.Role.ToString(),
                names = user.Names,
                surname = user.Surname
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in Me endpoint");
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            var ipAddress =
                HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var result = await _authService.LoginAsync(request, ipAddress);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = !_environment.IsDevelopment(),
                SameSite = _environment.IsDevelopment()
                    ? SameSiteMode.Lax
                    : SameSiteMode.None,
                Path = "/",
                Expires = result.ExpiresAt
            };

            Response.Cookies.Append("access_token", result.Token, cookieOptions);

            result.Token = string.Empty;

            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during login for {Email}", request.Email);

            if (_environment.IsDevelopment())
                return StatusCode(
                    500,
                    new
                    {
                        error = ex.Message,
                        detail = ex.ToString(),
                    }
                );

            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null)
                return Unauthorized(new { error = "Invalid token." });
            var userId = Guid.Parse(userIdClaim);
            var ipAddress =
                HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var result = await _authService.LogoutAsync(userId, ipAddress);

            Response.Cookies.Delete(
                "access_token",
                new CookieOptions
                {
                    Path = "/",
                    Secure = !_environment.IsDevelopment(),
                    SameSite = _environment.IsDevelopment()
                        ? SameSiteMode.Lax
                        : SameSiteMode.None,
                }
            );
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during logout");
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }
}