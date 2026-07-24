using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Officials.DTOs;
using Application.Features.Officials.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/officials")]
[Authorize]
public class OfficialsController : ControllerBase
{
    private readonly IOfficialBadgeService _officialBadgeService;

    public OfficialsController(IOfficialBadgeService officialBadgeService)
    {
        _officialBadgeService = officialBadgeService;
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
}