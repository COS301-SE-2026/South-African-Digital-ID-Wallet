using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.AdminDashboard.DTOs;
using Application.Features.AdminDashboard.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "GovernmentAdministrator")]
public class AdminDashboardController : ControllerBase
{
    private readonly IAdminDashboardService _adminDashboardService;

    public AdminDashboardController(IAdminDashboardService adminDashboardService)
    {
        _adminDashboardService = adminDashboardService;
    }

    /// <summary>
    /// Returns the admin dashboard landing page summary: system status, headline counts (users, institutions,
    /// credentials issued), and a system wide recent activity feed. The feed is restricted to an explicit allow
    /// list of institution/system-level event types so it never surfaces citizen-level data across institution boundaries.
    /// </summary>
    /// <response code="200">The dashboard summary.</response>
    /// <response code="403">The caller is not a Government Administrator.</response>
    [HttpGet("dashboard-summary")]
    [ProducesResponseType(typeof(DashboardSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetDashboardSummary()
    {
        var result = await _adminDashboardService.GetSummaryAsync();

        return Ok(result);
    }

    /// <summary>
    /// Returns the system-wide analytics for the requested date range: verifications, credentials issued, 
    /// active officials, and active institutions, each with a value, a percentage change against the immediately
    /// preceding period of equal length, and a daily-bucketed series. Computed live with no pre-aggregation.
    /// </summary>
    /// <param name="range">One of the "7d", "30d", "90d". Defaults to "30d" if omitted.</param>
    /// <response code="200">The requested analytics.</response>
    /// <response code="400">The range parameter was not one of the allowed values.</response>
    /// <response code="403">The caller is not a Government Administrator.</response>
    [HttpGet("analytics")]
    [ProducesResponseType(typeof(AnalyticsResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAnalytics([FromQuery] string? range)
    {
        try
        {
            var result = await _adminDashboardService.GetAnalyticsAsync(range);

            return Ok(result);
        }
        catch (InvalidAnalyticsRangeException iare)
        {
            return BadRequest(new { error = iare.Message });
        }
    }
}