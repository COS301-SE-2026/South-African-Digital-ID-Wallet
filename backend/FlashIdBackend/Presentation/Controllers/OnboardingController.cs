using Application.Common.Interfaces.ServiceInterfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.Features.Onboarding.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Interfaces.GatewayInterfaces;
using Application.Features.Onboarding.Dtos;

namespace Presentation.Controllers;

[ApiController]
[Route("api/onboarding")]
[Authorize(Roles = "Official")]
public class OnboardingController : ControllerBase
{
    private readonly IGovernmentRegistryGateway _registryGateway;
    private readonly IOnboardingService _onboardingService;

    public OnboardingController(
        IGovernmentRegistryGateway registryGateway,
       IOnboardingService onboardingService)
    {
        _registryGateway = registryGateway;
        _onboardingService = onboardingService;
    }

    [HttpGet("verify/{idNumber}")]
    public async Task<IActionResult> VerifyCitizenIdentity(string idNumber)
    {
        var record = await _registryGateway.GetCitizenBySaIdAsync(idNumber);

        if (record is null)
        {
            return NotFound(new { message = "Citizen record not found." });
        }

        return Ok(record);
    }

    [HttpPost("citizen")]
    public async Task<IActionResult> OnboardCitizen([FromBody] OnboardCitizenRequest request)
    {
        var response = await _onboardingService.OnboardCitizenAsync(request);

        return Ok(response);
    }
}