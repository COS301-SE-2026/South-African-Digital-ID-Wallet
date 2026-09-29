using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.UpdatePassword.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UpdatePasswordController : ControllerBase
{
    private readonly IUpdatePasswordService _updatePasswordService;

    public UpdatePasswordController(IUpdatePasswordService updatePasswordService)
    {
        _updatePasswordService = updatePasswordService;
    }

    [HttpPut]
    [EnableRateLimiting("update-password")]
    public async Task<IActionResult> UpdatePassword(
        [FromBody] UpdatePasswordDto dto)
    {
        var userIdClaim = User.FindFirst("userId")?.Value;

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var success = await _updatePasswordService.UpdatePasswordAsync(userId, dto);

        if (!success)
        {
            return BadRequest(new
            {
                message = "Failed to update password."
            });
        }

        return Ok(new
        {
            message = "Password updated successfully."
        });
    }
}