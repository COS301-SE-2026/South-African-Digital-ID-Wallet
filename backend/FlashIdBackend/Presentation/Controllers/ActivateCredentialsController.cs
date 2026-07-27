using System.Security.Claims;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Credentials.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/activate-credentials")]
[Authorize(Roles = "Citizen")]
public class ActivateCredentialsController : ControllerBase
{
    private readonly ICredentialActivationService _credentialActivationService;

    public ActivateCredentialsController(ICredentialActivationService credentialActivationService)
    {
        _credentialActivationService = credentialActivationService;
    }

    [HttpPost]
    public async Task<ActionResult<ActivateCredentialsResponseDto>> ActivateCredentials([FromBody] ActivateCredentialsRequestDto request, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { message = "The authenticated account could not be identified." });
        }

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        var response = await _credentialActivationService.ActivateCredentialsAsync(request, userId, ipAddress, cancellationToken);
        return Ok(response);
    }
}