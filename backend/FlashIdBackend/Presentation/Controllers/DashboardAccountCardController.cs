using Application.Common.Interfaces.ServiceInterfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/dashboard-account-card")]
[Authorize(Roles = "Citizen")]
public class DashboardAccountCardController : ControllerBase
{
    private readonly IDashboardAccountCardService _service;

    public DashboardAccountCardController(IDashboardAccountCardService service)
    {
        _service = service;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyAccount()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;

        if (userIdClaim == null)
            return Unauthorized();

        var account = await _service.GetMyAccountAsync(Guid.Parse(userIdClaim));

        if (account == null)
            return NotFound();

        return Ok(account);
    }
}