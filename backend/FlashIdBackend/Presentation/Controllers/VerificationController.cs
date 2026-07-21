using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Verification.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/citizen-verfication/token")]
[Authorize(Roles = "Citizen")]
public class VerificationController : ControllerBase
{
    private readonly ICitizenVerificationService _citizenVerificationService;

    public VerificationController(ICitizenVerificationService citizenVerificationService)
    {
        _citizenVerificationService = citizenVerificationService;
    }

    [HttpPost("activate")]
    public async Task<IActionResult> VerifyCitizenActivation([FromQuery] string token, [FromBody] VerificationRequestDto request, CancellationToken cancellationToken)
    {
        return Ok();
    }

}