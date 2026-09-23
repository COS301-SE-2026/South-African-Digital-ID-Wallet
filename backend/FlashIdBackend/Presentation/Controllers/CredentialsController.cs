using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Exceptions;
using Application.Common.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.RateLimiting;
using Application.Features.FraudDetection.Exceptions;
using Presentation.Security;

namespace Presentation.Controllers;

[ApiController]
[Route("api/credentials")]
[Authorize]
public class CredentialsController : ControllerBase
{
    // The audit trail records where a request came from. This is the fallback when the socket has no address.
    private const string UnknownIpAddress = "unknown";
    private readonly ICredentialService _credentialService;
    private readonly IQrService _qrService;
    private readonly ICredentialActivationService _credentialActivationService;
    private readonly ICredentialExpiryService _credentialExpiryService;
    private readonly IIssueCredentialService _issueCredentialService;
    private readonly ICredentialUpdateService _credentialUpdateService;
    private readonly IOfflinePackageService _offlinePackageService;

    public CredentialsController(
      ICredentialService credentialService,
      IQrService qrService,
      ICredentialActivationService credentialActivationService,
      ICredentialExpiryService credentialExpiryService,
      IIssueCredentialService issueCredentialService,
      ICredentialUpdateService credentialUpdateService,
      IOfflinePackageService offlinePackageService)
    {
        _credentialService = credentialService;
        _qrService = qrService;
        _credentialActivationService = credentialActivationService;
        _credentialExpiryService = credentialExpiryService;
        _issueCredentialService = issueCredentialService;
        _credentialUpdateService = credentialUpdateService;
        _offlinePackageService = offlinePackageService;
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
        [FromBody] GenerateQrRequestDto request,
        [FromServices] IFraudDetectionService fraudDetectionService)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null)
            {
                return Unauthorized(new { error = "Invalid token." });
            }

            var userId = Guid.Parse(userIdClaim);

            var securityContext = SecurityEventContextFactory.Create(HttpContext, userId, Domain.Enums.SecurityEventType.QrGenerated);
            await fraudDetectionService.EnsureQrGenerationAllowedAsync(securityContext, HttpContext.RequestAborted);

            var result = await _qrService.GenerateQrAsync(credentialId, userId, request);

            // Only successful generations are recorded. A high-risk result withholds this QR and blocks new ones.
            await fraudDetectionService.RecordQrGenerationAsync(securityContext, HttpContext.RequestAborted);
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
        catch (QrGenerationRestrictedException ex)
        {
            return StatusCode(403, new { error = ex.Message, code = ex.Code, restrictedUntil = ex.RestrictedUntil, alertId = ex.AlertId });
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
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? UnknownIpAddress;
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
    [EnableRateLimiting("citizen-status-lookup")]
    public async Task<IActionResult> GetCitizenStatus(string saId, CancellationToken cancellationToken)
    {
        var officialIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(officialIdValue, out var officialId))
        {
            return Unauthorized(new { message = "The authenticated official could not be identified." });
        }

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? UnknownIpAddress;
        var response = await _issueCredentialService.GetCitizenStatusAsync(saId, officialId, ipAddress, cancellationToken);

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

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? UnknownIpAddress;
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
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? UnknownIpAddress;
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
    [HttpPost("{credentialId}/reinstate")]
    [Authorize(Roles = "GovernmentAdministrator")]
    public async Task<IActionResult> ReinstateCredential(Guid credentialId, [FromBody] ReinstateCredentialRequestDto request)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null) return Unauthorized(new { error = "Invalid token." });

            var adminUserId = Guid.Parse(userIdClaim);
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? UnknownIpAddress;
            var result = await _credentialService.ReinstateCredentialAsync(credentialId, adminUserId, request, ipAddress);
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

    [HttpGet("search")]
    [Authorize(Roles = "GovernmentAdministrator")]
    public async Task<IActionResult> SearchCitizens([FromQuery] string? query, [FromQuery] int page = 1, [FromQuery] int pageSize = 15)
    {
        try
        {
            var result = await _credentialService.SearchCitizensAsync(query, page, pageSize);
            return Ok(result);
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    [HttpGet("citizen/{citizenId}")]
    [Authorize(Roles = "GovernmentAdministrator")]
    public async Task<IActionResult> GetCredentialsForCitizen(Guid citizenId)
    {
        try
        {
            var result = await _credentialService.GetCredentialsForCitizenAsync(citizenId);
            return Ok(result);
        }
        catch (CitizenNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    /// <summary>
    /// Manually runs the daily citizen-credential update check.
    /// </summary>
    /// <response code="200">The check ran (or had already run today). See body for status.</response>
    /// <response code="403">Caller is not a Government Administrator.</response>
    /// <response code="409">Another update check is currently running for today.</response>
    [HttpPost("update-check")]
    [Authorize(Roles = "GovernmentAdministrator")]
    [ProducesResponseType(typeof(CredentialUpdateCheckResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> TriggerUpdateCheck(CancellationToken cancellationToken)
    {
        try
        {
            var res = await _credentialUpdateService.RunUpdateCheckAsync(cancellationToken);
            return res.Failed ? StatusCode(500, res) : Ok(res);
        }
        catch (CredentialUpdateJobAlreadyRunningException cuare)
        {
            return Conflict(new { error = cuare.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    /// <summary>
    /// Prepares the citizen's offline credential package, minting it if none is stored or the stored one is stale.
    /// </summary>
    /// <param name="credentialId">The credential to prepare for offline presentation.</param>
    /// <param name="cancellationToken">Token used to cancel the operation if the request is aborted.</param>
    /// <response code="200">The offline package, ready to be cached on the device.</response>
    /// <response code="400">The credential is not active.</response>
    /// <response code="403">The credential belongs to another citizen.</response>
    /// <response code="404">No credential with that id.</response>
    /// <response code="409">The credential cannot produce a presentation: missing a photograph, or the document has expired.</response>
    /// <response code="503">The package could not be prepared right now. The wallet should retry later.</response>
    [HttpPost("{credentialId:guid}/offline-package")]
    [Authorize(Roles = "Citizen")]
    [ProducesResponseType(typeof(OfflinePackageResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> RequestOfflinePackage(Guid credentialId, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst("userId")?.Value;

        if (userIdClaim == null)
        {
            return Unauthorized(new { error = "Invalid token." });
        }

        var userId = Guid.Parse(userIdClaim);
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? UnknownIpAddress;

        try
        {
            // deviceKey stays null until Phase 4, when the wallet sends its holder key and this becomes a POST.
            var package = await _offlinePackageService.GetOrMintAsync(credentialId, userId, null, ipAddress, cancellationToken);

            return Ok(package);
        }
        catch (CredentialNotFoundException cnfe)
        {
            return NotFound(new { error = cnfe.Message });
        }
        catch (CredentialAccessDeniedException cade)
        {
            return StatusCode(403, new { error = cade.Message });
        }
        catch (CredentialNotActiveException cnae)
        {
            return BadRequest(new { error = cnae.Message });
        }
        catch (OfflinePackageDataMissingException opdme)
        {
            return Conflict(new { error = opdme.Message });
        }
        catch (OfflinePackageUnavailableException opue)
        {
            return StatusCode(503, new { error = opue.Message });
        }
        catch (OfflinePackageDocumentExpiredException opdee)
        {
            return StatusCode(503, new { error = opdee.Message });
        }
    }

    /// <summary>
    /// Returns the public keys that verify offline credentials, for a verifier to cache before going offline.
    /// </summary>
    /// <param name="cancellationToken">Token used to cancel the operation if the request is aborted.</param>
    /// <response code="200">The issuer key set, with the time it was retrieved so the verifier can age it.</response>
    [HttpGet("issuer-keys")]
    [ProducesResponseType(typeof(IssuerKeysResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetIssuerKeys(CancellationToken cancellationToken)
    {
        var keys = await _offlinePackageService.GetIssuerKeysAsync(cancellationToken);

        return Ok(keys);
    }
}
