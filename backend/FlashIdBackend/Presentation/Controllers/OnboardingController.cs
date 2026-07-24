using System.Security.Claims;
using Application.Common.Interfaces.ServiceInterfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.Features.Onboarding.Exceptions;
using Application.Features.Onboarding.Dtos;

namespace Presentation.Controllers;

[ApiController]
[Route("api/onboarding")]
[Authorize(Roles = "Official")]
public class OnboardingController : ControllerBase
{
    private readonly IOnboardingService _onboardingService;

    public OnboardingController(
       IOnboardingService onboardingService)
    {
        _onboardingService = onboardingService;
    }

    [HttpGet("verify/{idNumber}")]
    public async Task<IActionResult> VerifyCitizenIdentity(string idNumber)
    {
        try
        {
            var record = await _onboardingService.VerifyCitizenIdentityAsync(idNumber);
            return Ok(record);
        }
        catch (IdentityRecordNotFoundException)
        {
            return NotFound(new { message = "Citizen record not found in government registry." });
        }
    }

    [HttpPost("citizen")]
    public async Task<IActionResult> OnboardCitizen([FromBody] OnboardCitizenRequest request)
    {
        var officialIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(officialIdValue, out var officialId))
        {
            return Unauthorized(new { message = "the authenticated official could not be identified." });
        }
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        var response = await _onboardingService.OnboardCitizenAsync(request, officialId, ipAddress);

        return Ok(response);
    }
}