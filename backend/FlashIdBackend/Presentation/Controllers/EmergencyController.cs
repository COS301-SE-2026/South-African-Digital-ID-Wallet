using System.Security.Claims;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Emergency.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Presentation.Controllers;

[ApiController]
[Route("api/emergency")]
[Authorize]
public class EmergencyController : ControllerBase
{
    private readonly IEmergencyService _emergencyService;

    public EmergencyController(IEmergencyService emergencyService) => _emergencyService = emergencyService;

    [HttpPost("resolve")]
    [Authorize(Roles = "Official")]
    [EnableRateLimiting("emergency-resolve")]
    [ProducesResponseType(typeof(EmergencyProfileResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Resolve(
        [FromBody] ResolveEmergencyRequestDto request, CancellationToken ct)
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var responderId))
        {
            return Unauthorized();
        }

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return Ok(await _emergencyService.ResolveAsync(request, responderId, ip, ct));
    }

    [HttpPost("devices")]
    [Authorize(Roles = "Citizen")]
    public async Task<IActionResult> RegisterDevice(
        [FromBody] RegisterEmergencyDeviceRequestDto request, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirst("userId")!.Value);
        return Ok(await _emergencyService.RegisterDeviceAsync(request, userId, ct));
    }

    [HttpGet("profile")]
    [Authorize(Roles = "Citizen")]
    public async Task<IActionResult> GetProfile(CancellationToken ct) =>
        Ok(await _emergencyService.GetMyProfileAsync(CitizenUserId(), ct));

    [HttpPut("profile")]
    [Authorize(Roles = "Citizen")]
    public async Task<IActionResult> SaveProfile(
        [FromBody] SaveEmergencyProfileRequestDto request, CancellationToken ct) =>
        Ok(await _emergencyService.SaveProfileAsync(request, CitizenUserId(), ct));

    [HttpGet("offline-credential")]
    [Authorize(Roles = "Citizen")]
    public async Task<IActionResult> GetOfflineCredential(CancellationToken ct) =>
        Ok(await _emergencyService.BuildOfflineCredentialAsync(CitizenUserId(), ct));

    [HttpGet("accesses")]
    [Authorize(Roles = "Citizen")]
    public async Task<IActionResult> GetAccesses(CancellationToken ct) =>
        Ok(await _emergencyService.GetMyAccessHistoryAsync(CitizenUserId(), ct));

    private Guid CitizenUserId() => Guid.Parse(User.FindFirst("userId")!.Value);
}