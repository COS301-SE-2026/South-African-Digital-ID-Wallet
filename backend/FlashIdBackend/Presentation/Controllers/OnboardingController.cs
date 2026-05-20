using Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/onboarding")]
public class OnboardingController : ControllerBase
{
    private readonly MockGovernmentRegistryService _registryService;

    public OnboardingController(MockGovernmentRegistryService registryService)
    {
        _registryService = registryService;
    }

    [HttpGet("verify/{idNumber}")]
    public IActionResult VerifyCitizenIdentity(string idNumber)
    {
        var record = _registryService.GetBySaId(idNumber);

        return Ok(record);
    }
}