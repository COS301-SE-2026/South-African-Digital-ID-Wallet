using Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Application.Features.Onboarding.Exceptions;

namespace Presentation.Controllers;

[ApiController]
[Route("api/onboarding")]
/*TODO: Implement retrieval of credential data once moch-gov db set up :)*/
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

        if (record is null)
        {
            throw new IdentityRecordNotFoundException();
        }

        return Ok(record);
    }
}