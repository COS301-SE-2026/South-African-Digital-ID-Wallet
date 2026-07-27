using Application.Common.Interfaces.ServiceInterfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/activity")]
[Authorize(Roles = "Citizen")]
public class ActivityOverviewController : ControllerBase
{
    private readonly IActivityOverviewService _activityService;

    public ActivityOverviewController(IActivityOverviewService activityService)
    {
        _activityService = activityService;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyActivity()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;

        if (userIdClaim == null)
            return Unauthorized();

        var userId = Guid.Parse(userIdClaim);

        var activity = await _activityService.GetMyActivityAsync(userId);

        return Ok(activity);
    }
}