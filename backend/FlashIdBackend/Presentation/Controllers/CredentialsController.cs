using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.RateLimiting;

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
    private readonly IIssueCredentialService _issueCredentialService;

    public CredentialsController(
      ICredentialService credentialService,
      IQrService qrService,
      ICredentialActivationService credentialActivationService,
      ICredentialExpiryService credentialExpiryService,
      IIssueCredentialService issueCredentialService)
    {
        _credentialService = credentialService;
        _qrService = qrService;
        _credentialActivationService = credentialActivationService;
        _credentialExpiryService = credentialExpiryService;
        _issueCredentialService = issueCredentialService;
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

    /// <summary>
    /// Looks up a citizen in FlashID by SA ID and returns their onboarding status and existing credentials.
    /// </summary>
    /// <param name="saId">The citizen's 13 digit SA ID number</param>
    /// <param name="cancellationToken">Token used to cancel the operation if the request is aborted.</param>
    /// <response code="200">The citizen was found.</response>
    /// <response code="400">The SA ID is not a valid 13 digit SA ID number.</response>
    /// <response code="404">No FlashID citizen record exists for this SA ID.</response>
    [HttpGet("citizens/{saId}/status")]
    [Authorize(Roles = "Official")]
    [ProducesResponseType(typeof(CitizenCredentialStatusResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCitizenStatus(string saId, CancellationToken cancellationToken)
    {
        var response = await _issueCredentialService.GetCitizenStatusAsync(saId, cancellationToken);

        return Ok(response);
    }

    /// <summary>
    /// Fetches a citizen's credential from the government registry and issues it into FlashID.
    /// </summary>
    /// <param name="cancellationToken">Token used to cancel the operation if the request is aborted.</param>
    /// <response code="201">The credential was issued.</response>
    /// <response code="400">Validation error, or consent not given.</response>
    /// <response code="404">Citizen not found in FlashID, or no matching record at the government registry.</response>
    /// <response code="409">Citizen is not Activated, or already has an active credential of that type.</response>
    [HttpPost("issue")]
    [Authorize(Roles = "Official")]
    [EnableRateLimiting("issue-credential")]
    [ProducesResponseType(typeof(CredentialResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> IssueCredential([FromBody] IssueCredentialRequestDto request, CancellationToken cancellationToken)
    {
        var officialIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(officialIdValue, out var officialId))
        {
            return Unauthorized(new { message = "The authenticated official could not be identified." });
        }

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        var response = await _issueCredentialService.IssueCredentialAsync(request, officialId, ipAddress, cancellationToken);

        return StatusCode(201, response);
    }

    [HttpPost("{credentialId}/revoke")]
    [Authorize(Roles = "GovernmentAdministrator")]
    public async Task<IActionResult> RevokeCredential(Guid credentialId, [FromBody] RevokeCredentialRequestDto request)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null) return Unauthorized(new { error = "Invalid token." });

            var adminUserId = Guid.Parse(userIdClaim);
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var result = await _credentialService.RevokeCredentialAsync(credentialId, adminUserId, request, ipAddress);
            return Ok(result);
        }
        catch (CredentialNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidCredentialStatusTransitionException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }
}