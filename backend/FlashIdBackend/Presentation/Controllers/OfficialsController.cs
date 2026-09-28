using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Services;
using Application.Features.Officials.DTOs;
using Application.Features.Officials.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/officials")]
[Authorize]
public class OfficialsController : ControllerBase
{
    private readonly IOfficialBadgeService _officialBadgeService;
    private readonly IOfficialActivityService _officialActivityService;

    public OfficialsController(IOfficialBadgeService officialBadgeService, IOfficialActivityService officialActivityService)
    {
        _officialBadgeService = officialBadgeService;
        _officialActivityService = officialActivityService;
    }

    [HttpPost("badge-token")]
    [Authorize(Roles = "Official")]
    public async Task<IActionResult> GenerateBadgeToken()
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null) return Unauthorized(new { error = "Invalid token." });

            var userId = Guid.Parse(userIdClaim);
            var result = await _officialBadgeService.GenerateBadgeTokenAsync(userId);
            return Ok(result);
        }
        catch (OfficialNotFoundException ofne)
        {
            return NotFound(new { error = ofne.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    [HttpPost("verify-badge")]
    public async Task<IActionResult> VerifyBadge([FromBody] VerifyBadgeRequestDto req)
    {
        try
        {
            var res = await _officialBadgeService.VerifyBadgeAsync(req.Token);
            return Ok(res);
        }
        catch (InvalidBadgeTokenException ibte)
        {
            return BadRequest(new { error = ibte.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    /// <summary>
    /// Returns the authenticated official's own recent activity (audit log entries they performed), most recent first.
    /// </summary>
    /// <param name="limit">Maximum number of items to return. Clamped server side to [1, 20], default 5</param>
    /// <response code="200">The official's recent activity.</response>
    /// <response code="401">The caller is not authenticated, or the token could not be resolved to a user.</response>
    [HttpGet("activity/me")]
    [Authorize(Roles = "Official")]
    [ProducesResponseType(typeof(MyActivityResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyActivity([FromQuery] int? limit)
    {
        var userIdClaim = User.FindFirst("userId")?.Value;

        if (userIdClaim == null) return Unauthorized(new { error = "Invalid token." });

        var userId = Guid.Parse(userIdClaim);
        var result = await _officialActivityService.GetMyActivityAsync(userId, limit);

        return Ok(result);
    }

    /// <summary>
    /// Returns a paginated, filterable audit history for every official at the caller's own instaitution.
    /// Institution is always derived server side from the authenticated official. Never accepted as a parameter.
    /// Every call is itself audit-logged for POPIA accountability.
    /// </summary>
    /// <param name="search">Free text filter matching action, citizen name, performing official's name, or outcome/type.</param>
    /// <param name="action">Filters to a specific audit event type.</param>
    /// <param name="dateFrom">Inclusive lower bound on the entity's timestamp.</param>
    /// <param name="dateTo">Inclusive upper bound on the entity's timestamp.</param>
    /// <param name="type">Filters by outcome: "Success" or "Failed".</param>
    /// <param name="page">1-based page number. Clamped server side to >= 1.</param>
    /// <param name="pageSize">Items per page. Clamped server side to [1, 100], default 7.</param>
    /// <response code="200">The requested page of institution audit history.</response>
    /// <response code="401">The caller is not authenticated, or the token could not be resolved to a user.</response>
    [HttpGet("history")]
    [Authorize(Roles = "Official")]
    [ProducesResponseType(typeof(OfficialHistoryResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetHistory(
        [FromQuery] string? search,
        [FromQuery] string? action,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] string? type,
        [FromQuery] int? page,
        [FromQuery] int? pageSize
    )
    {
        var userIdClaim = User.FindFirst("userId")?.Value;

        if (userIdClaim == null) return Unauthorized(new { error = "Invalid token." });

        var userId = Guid.Parse(userIdClaim);
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        try
        {
            var result = await _officialActivityService.GetInstitutionHistoryAsync(userId, search, action, dateFrom, dateTo, type, page, pageSize, ipAddress);
            return Ok(result);
        }
        catch (UnauthorizedAccessException uae)
        {
            return Unauthorized(new { error = uae.Message });
        }
    }

    [HttpGet("history/actions")]
    [Authorize(Roles = "Official")]
    [ProducesResponseType(typeof(OfficialHistoryActionsResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetHistoryActions()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;

        if (userIdClaim == null) return Unauthorized(new { error = "Invalid token." });

        var userId = Guid.Parse(userIdClaim);

        try
        {
            var result = await _officialActivityService.GetInstitutionActionsAsync(userId);
            return Ok(result);
        }
        catch (UnauthorizedAccessException uae)
        {
            return Unauthorized(new { error = uae.Message });
        }
    }

    [HttpGet("stats/me")]
    [Authorize(Roles = "Official")]
    [ProducesResponseType(
    typeof(OfficialStatsResponseDto),
    StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyStats()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;

        if (userIdClaim == null)
            return Unauthorized(new { error = "Invalid token." });

        var userId = Guid.Parse(userIdClaim);

        try
        {
            var result = await _officialActivityService.GetMyStatsAsync(userId);
            return Ok(result);
        }
        catch (UnauthorizedAccessException exception)
        {
            return Unauthorized(new { error = exception.Message });
        }
    }
}