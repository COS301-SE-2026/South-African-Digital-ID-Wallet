using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Security;
using Application.Features.FraudDetection.DTOs;
using Application.Features.FraudDetection.Exceptions;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.Security;

namespace Presentation.Controllers;

[ApiController]
[Route("api/security")]
[Authorize(Roles = "Citizen")]
public class SecurityController : ControllerBase
{
    private readonly IFraudDetectionService _fraudDetectionService;
    private readonly IHostEnvironment _environment;

    public SecurityController(IFraudDetectionService fraudDetectionService, IHostEnvironment environment)
    {
        _fraudDetectionService = fraudDetectionService;
        _environment = environment;
    }

    [HttpGet("overview")]
    [ProducesResponseType(typeof(SecurityOverviewDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOverview(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized(new { error = "Invalid token." });

        return Ok(await _fraudDetectionService.GetSecurityOverviewAsync(userId, cancellationToken));
    }

    [HttpGet("activity")]
    [ProducesResponseType(typeof(List<SecurityActivityItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActivity([FromQuery] int limit = 20, CancellationToken cancellationToken = default)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized(new { error = "Invalid token." });

        return Ok(await _fraudDetectionService.GetActivityAsync(userId, limit, cancellationToken));
    }

    [HttpGet("alerts")]
    [ProducesResponseType(typeof(List<FraudAlertSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAlerts([FromQuery] FraudAlertStatus? status, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized(new { error = "Invalid token." });

        return Ok(await _fraudDetectionService.GetAlertsAsync(userId, status, cancellationToken));
    }

    [HttpGet("alerts/{alertId:guid}")]
    [ProducesResponseType(typeof(FraudAlertDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAlert(Guid alertId, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized(new { error = "Invalid token." });

        try
        {
            return Ok(await _fraudDetectionService.GetAlertDetailsAsync(userId, alertId, cancellationToken));
        }
        catch (FraudAlertNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpPost("alerts/{alertId:guid}/secure")]
    [ProducesResponseType(typeof(SecureAccountResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> SecureAccount(Guid alertId, [FromBody] SecureAccountRequestDto request,
        [FromHeader(Name = "X-Client")] string? client, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized(new { error = "Invalid token." });

        try
        {
            var result = await _fraudDetectionService.SecureAccountAsync(
                userId, alertId, request, SecurityEventContextFactory.ReadDeviceToken(Request), ClientIp(), cancellationToken);

            if (!string.IsNullOrWhiteSpace(result.Token))
            {
                Response.Cookies.Append("access_token", result.Token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = !_environment.IsDevelopment(),
                    SameSite = _environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
                    Path = "/",
                    Expires = result.ExpiresAt,
                    IsEssential = true,
                });
            }

            if (!IsNativeClient(client))
            {
                result.Token = null;
            }

            return Ok(result);
        }
        catch (FraudAlertNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (FraudAlertAlreadyResolvedException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (ArgumentOutOfRangeException)
        {
            return BadRequest(new { error = "Unsupported security action." });
        }
    }

    [HttpPost("alerts/{alertId:guid}/dismiss")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DismissAlert(Guid alertId, [FromBody] DismissFraudAlertRequestDto request, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized(new { error = "Invalid token." });

        try
        {
            await _fraudDetectionService.DismissAlertAsync(userId, alertId, request, ClientIp(), cancellationToken);
            return NoContent();
        }
        catch (FraudAlertNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (FraudAlertAlreadyResolvedException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (StepUpVerificationFailedException ex)
        {
            return Unauthorized(new { error = ex.Message, code = StepUpVerificationFailedException.ErrorCode });
        }
    }

    [HttpGet("settings")]
    [ProducesResponseType(typeof(SecuritySettingsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSettings(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized(new { error = "Invalid token." });

        return Ok(await _fraudDetectionService.GetSettingsAsync(userId, cancellationToken));
    }

    [HttpPut("settings")]
    [ProducesResponseType(typeof(SecuritySettingsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateSecuritySettingsRequestDto request, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized(new { error = "Invalid token." });

        try
        {
            return Ok(await _fraudDetectionService.UpdateSettingsAsync(userId, request, ClientIp(), cancellationToken));
        }
        catch (StepUpVerificationFailedException ex)
        {
            return Unauthorized(new { error = ex.Message, code = StepUpVerificationFailedException.ErrorCode });
        }
    }

    [HttpPost("simulate")]
    [ProducesResponseType(typeof(FraudAssessmentResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Simulate([FromBody] SimulateSecurityEventRequestDto request, CancellationToken cancellationToken)
    {
        if (!_environment.IsDevelopment() && !_environment.IsEnvironment("Testing")) return NotFound();
        if (!TryGetUserId(out var userId)) return Unauthorized(new { error = "Invalid token." });

        if (!GeoDistance.IsValidCoordinate(request.Latitude, request.Longitude))
        {
            return BadRequest(new { error = "Latitude must be between -90 and 90 and longitude between -180 and 180." });
        }

        var context = SecurityEventContextFactory.Create(HttpContext, userId, request.EventType, request.DeviceToken);
        context.IpAddress = "simulated";
        context.ClientLatitude = request.Latitude;
        context.ClientLongitude = request.Longitude;
        context.ClientCity = request.City;
        context.ClientCountry = request.Country;

        return Ok(await _fraudDetectionService.RecordSecurityEventAsync(context, cancellationToken));
    }

    private bool TryGetUserId(out Guid userId) =>
        Guid.TryParse(User.FindFirst("userId")?.Value, out userId);

    private string ClientIp() => HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

    private bool IsNativeClient(string? client) =>
        string.Equals(client, "mobile", StringComparison.Ordinal) &&
        !Request.Headers.ContainsKey("Origin") &&
        !Request.Headers.ContainsKey("Sec-Fetch-Site");
}
