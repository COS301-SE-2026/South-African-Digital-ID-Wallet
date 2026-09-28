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
    private const string UserIdClaim = "userId";

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
        if (!TryGetUserId(out var responderId))
        {
            return Unauthorized();
        }

        return Ok(await _emergencyService.ResolveAsync(request, responderId, ClientIp(), ct));
    }

    [HttpPost("offline-accesses")]
    [Authorize(Roles = "Official")]
    [EnableRateLimiting("emergency-offline-access")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RecordOfflineAccess(
        [FromBody] RecordOfflineEmergencyAccessRequestDto request, CancellationToken ct)
    {
        if (!TryGetUserId(out var responderId))
        {
            return Unauthorized();
        }

        await _emergencyService.RecordOfflineAccessAsync(request, responderId, ClientIp(), ct);
        return NoContent();
    }

    [HttpPost("devices")]
    [Authorize(Roles = "Citizen")]
    public async Task<IActionResult> RegisterDevice(
        [FromBody] RegisterEmergencyDeviceRequestDto request, CancellationToken ct) =>
        TryGetUserId(out var userId)
            ? Ok(await _emergencyService.RegisterDeviceAsync(request, userId, ct))
            : Unauthorized();

    [HttpGet("profile")]
    [Authorize(Roles = "Citizen")]
    public async Task<IActionResult> GetProfile(CancellationToken ct) =>
        TryGetUserId(out var userId)
            ? Ok(await _emergencyService.GetMyProfileAsync(userId, ct))
            : Unauthorized();

    [HttpPut("profile")]
    [Authorize(Roles = "Citizen")]
    public async Task<IActionResult> SaveProfile(
        [FromBody] SaveEmergencyProfileRequestDto request, CancellationToken ct) =>
        TryGetUserId(out var userId)
            ? Ok(await _emergencyService.SaveProfileAsync(request, userId, ct))
            : Unauthorized();

    [HttpGet("offline-credential")]
    [Authorize(Roles = "Citizen")]
    public async Task<IActionResult> GetOfflineCredential(CancellationToken ct) =>
        TryGetUserId(out var userId)
            ? Ok(await _emergencyService.BuildOfflineCredentialAsync(userId, ct))
            : Unauthorized();

    [HttpGet("accesses")]
    [Authorize(Roles = "Citizen")]
    public async Task<IActionResult> GetAccesses(CancellationToken ct) =>
        TryGetUserId(out var userId)
            ? Ok(await _emergencyService.GetMyAccessHistoryAsync(userId, ct))
            : Unauthorized();

    private bool TryGetUserId(out Guid userId) =>
        Guid.TryParse(User.FindFirst(UserIdClaim)?.Value, out userId);

    private string ClientIp() => HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
}
