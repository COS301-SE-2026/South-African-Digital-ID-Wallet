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
    
    [HttpGet("activity/me")]
    [Authorize(Roles = "Official")]
    public async Task<IActionResult> GetMyActivity([FromQuery] int? limit)
    {
        var userIdClaim = User.FindFirst("userId")?.Value;

        if (userIdClaim == null) return Unauthorized(new { error = "Invalid token." });

        var userId = Guid.Parse(userIdClaim);
        var result = await _officialActivityService.GetMyActivityAsync(userId, limit);

        return Ok(result);
    }

    [HttpGet("history")]
    [Authorize(Roles = "Official")]
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
}