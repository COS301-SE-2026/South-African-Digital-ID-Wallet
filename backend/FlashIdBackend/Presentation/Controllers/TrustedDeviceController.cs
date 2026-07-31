using Application.Common.Interfaces.ServiceInterfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/trusted-devices")]
[Authorize(Roles = "Citizen")]
public class TrustedDevicesController : ControllerBase
{
    private readonly ITrustedDeviceService _trustedDeviceService;

    public TrustedDevicesController(ITrustedDeviceService trustedDeviceService)
    {
        _trustedDeviceService = trustedDeviceService;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyTrustedDevices()
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;

            if (userIdClaim == null)
            {
                return Unauthorized(new { error = "Invalid token." });
            }

            var userId = Guid.Parse(userIdClaim);

            Request.Cookies.TryGetValue("flashid_device", out var currentDeviceToken);

            var result = await _trustedDeviceService.GetMyTrustedDevicesAsync(userId, currentDeviceToken);

            return Ok(result);
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    [HttpDelete("{deviceId:guid}")]
    public async Task<IActionResult> UnlinkDevice(Guid deviceId)
    {
        var userIdClaim = User.FindFirst("userId")?.Value;

        if (userIdClaim == null)
            return Unauthorized();

        var success = await _trustedDeviceService.UnlinkDeviceAsync(
            Guid.Parse(userIdClaim),
            deviceId);

        if (!success)
            return NotFound();

        return NoContent();
    }
}