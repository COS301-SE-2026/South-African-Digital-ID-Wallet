using System.Security.Claims;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Verification.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/citizen-verfication")]
[Authorize(Roles = "Citizen")]
public class VerificationController : ControllerBase
{
    private readonly ICitizenVerificationService _citizenVerificationService;

    public VerificationController(ICitizenVerificationService citizenVerificationService)
    {
        _citizenVerificationService = citizenVerificationService;
    }

    [HttpPost("activate-token")]
    public async Task<IActionResult> VerifyCitizenActivation([FromQuery] string token, [FromBody] VerificationRequestDto request, CancellationToken cancellationToken)
    {
        var userIdvalue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdvalue, out var userId))
        {
            return Unauthorized(new { message = "The authenticated account could not be identified." });
        }

        var response = await _citizenVerificationService.VerifyCitizenActivation(request, userId, cancellationToken);
        return Ok(response);
    }

}