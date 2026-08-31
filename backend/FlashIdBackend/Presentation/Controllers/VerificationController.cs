using System.Security.Claims;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Verification.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/citizen-verification")]
[Authorize(Roles = "Citizen")]
public class VerificationController : ControllerBase
{
    private readonly ICitizenVerificationService _citizenVerificationService;
    private readonly IPhysicalIdentityVerificationService _physicalIdentityVerificationService;
    public VerificationController(ICitizenVerificationService citizenVerificationService, IPhysicalIdentityVerificationService physicalIdentityVerificationService)
    {
        _citizenVerificationService = citizenVerificationService;
        _physicalIdentityVerificationService = physicalIdentityVerificationService;
    }

    [HttpPost("activate-token")]
    public async Task<IActionResult> VerifyCitizenActivation([FromBody] VerificationRequestDto request, CancellationToken cancellationToken)
    {
        var userIdvalue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdvalue, out var userId))
        {
            return Unauthorized(new { message = "The authenticated account could not be identified." });
        }

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        var response = await _citizenVerificationService.VerifyCitizenActivation(request, userId, ipAddress, cancellationToken);
        return Ok(response);
    }

    [HttpPost("physical")]
    public async Task<IActionResult> StartPhysicalVerification(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var result = await _physicalIdentityVerificationService.StartAsync(userId, cancellationToken);

        return Ok(result);
    }

    [HttpPost("physical/{verificationId:guid/consent}")]
    public async Task<IActionResult> GrantPhysicalConsent(Guid verificationId, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var result = await _physicalIdentityVerificationService.GrantConsentAsync(verificationId, userId, cancellationToken);
        return Ok(result);
    }

    [HttpPost("physical/{verificationId:guid}/liveness-session")]
    public async Task<IActionResult> CreateLivenessSession(Guid verificationId, IFormFile referenceImage,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        await using var stream = referenceImage.OpenReadStream();

        var result = await _physicalIdentityVerificationService.CreateLivenessSessionAsync(verificationId, userId, stream, referenceImage.ContentType, cancellationToken);

        return Ok(result);
    }

    private bool TryGetUserId(out Guid userId)
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out userId);
    }

}