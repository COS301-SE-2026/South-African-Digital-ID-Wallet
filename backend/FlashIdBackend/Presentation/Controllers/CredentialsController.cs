using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/credentials")]
[Authorize]
public class CredentialsController : ControllerBase
{
    private readonly ICredentialService _credentialService;
    private readonly IQrService _qrService;
    private readonly ICredentialActivationService _credentialActivationService;
    private readonly ICredentialExpiryService _credentialExpiryService;

    public CredentialsController(
      ICredentialService credentialService,
      IQrService qrService,
      ICredentialActivationService credentialActivationService,
      ICredentialExpiryService credentialExpiryService)
    {
        _credentialService = credentialService;
        _qrService = qrService;
        _credentialActivationService = credentialActivationService;
        _credentialExpiryService = credentialExpiryService;
    }


    [HttpGet("me")]
    [Authorize(Roles = "Citizen")]
    public async Task<IActionResult> GetMyCredentials()
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null)
            {
                return Unauthorized(new { error = "Invalid token." });
            }

            var userId = Guid.Parse(userIdClaim);
            var result = await _credentialService.GetMyCredentialsAsync(userId);
            return Ok(result);
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    [HttpGet("mine")]
    public async Task<IActionResult> GetMyCredentialSummaries()
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null)
            {
                return Unauthorized(new { error = "Invalid token." });
            }

            var userId = Guid.Parse(userIdClaim);
            var result = await _qrService.GetMyCredentialsAsync(userId);
            return Ok(result);
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    [HttpPost("{credentialId}/qr-token")]
    public async Task<IActionResult> GenerateQr(
        Guid credentialId,
        [FromBody] GenerateQrRequestDto request)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null)
            {
                return Unauthorized(new { error = "Invalid token." });
            }

            var userId = Guid.Parse(userIdClaim);
            var result = await _qrService.GenerateQrAsync(credentialId, userId, request);
            return Ok(result);
        }
        catch (CredentialNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (CredentialAccessDeniedException ex)
        {
            return StatusCode(403, new { error = ex.Message });
        }
        catch (CredentialNotActiveException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidDisclosedFieldsException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    [HttpPost("resolve")]
    public async Task<IActionResult> Resolve([FromBody] ResolveCredentialRequestDto req)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null) return Unauthorized(new { error = "Invalid token." });

            var userId = Guid.Parse(userIdClaim);
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var res = await _qrService.ResolveAsync(req.Token, userId, ipAddress);
            return Ok(res);
        }
        catch (InvalidDisclosureTokenException idte)
        {
            return BadRequest(new { error = idte.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    /// <summary>
    /// Manually triggers the daily credential-expiry check. Government Administrator only.
    /// Idempotent. If today's check already completed or is currently running, returns that result instead of reprocessing.
    /// </summary>
    /// <param name="cancellationToken">Token used to cancel the operation if the request is aborted.</param>
    /// <response code="200">The check ran, or had already completed for today.</response>
    /// <response code="409">Another expiry check is currently running for today.</response>
    /// <response code="403">The caller is not a Government Administrator.</response>
    [HttpPost("expiry-check")]
    [Authorize(Roles = "GovernmentAdministrator")]
    [ProducesResponseType(typeof(CredentialExpiryCheckResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> TriggerExpiryCheck(CancellationToken cancellationToken)
    {
        try
        {
            var res = await _credentialExpiryService.RunExpiryCheckAsync(cancellationToken);
            return res.Failed ? StatusCode(500, res) : Ok(res);
        }
        catch (CredentialExpiryJobAlreadyRunningException cejare)
        {
            return Conflict(new { error = cejare.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }
}