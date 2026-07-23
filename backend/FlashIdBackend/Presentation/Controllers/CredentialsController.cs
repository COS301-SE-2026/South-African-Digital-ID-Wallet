using System.Security.Claims;
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
    private readonly IQrService _qrService;
    private readonly ICredentialActivationService _credentialActivationService;

    public CredentialsController(IQrService qrService, ICredentialActivationService credentialActivationService)
    {
        _qrService = qrService;
        _credentialActivationService = credentialActivationService;
    }

    [HttpPost("{credentialId}/qr-token")]
    public async Task<IActionResult> GenerateQr(Guid credentialId, [FromBody] GenerateQrRequestDto request)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null) return Unauthorized(new { error = "Invalid token." });

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

    [HttpGet("mine")]
    public async Task<IActionResult> GetMyCredentials()
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null) return Unauthorized(new { error = "Invalid token." });

            var userId = Guid.Parse(userIdClaim);
            var result = await _qrService.GetMyCredentialsAsync(userId);
            return Ok(result);
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }
}