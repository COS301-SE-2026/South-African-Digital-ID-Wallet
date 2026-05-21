using Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Application.Features.Onboarding.Exceptions;
using Application.Common.Interfaces;
using Application.Features.Onboarding.Dtos;

namespace Presentation.Controllers;

[ApiController]
[Route("api/onboarding")]
/*TODO: Implement retrieval of credential data once moch-gov db set up :)*/
public class OnboardingController : ControllerBase
{
    private readonly MockGovernmentRegistryService _registryService;
    private readonly IOnboardingService _onboardingService;

    public OnboardingController(
       MockGovernmentRegistryService registryService,
       IOnboardingService onboardingService)
    {
        _registryService = registryService;
        _onboardingService = onboardingService;
    }

    [HttpGet("verify/{idNumber}")]
    public IActionResult VerifyCitizenIdentity(string idNumber)
    {
        var record = _registryService.GetBySaId(idNumber);

        if (record is null)
        {
            throw new IdentityRecordNotFoundException();
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