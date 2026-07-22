using System.Net;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/credentials")]
public class CredentialsController:ControllerBase
{
    private ICredentials _credentialsService;
    public CredentialsController(ICredentials credentialsService)
    {
        _credentialsService = credentialsService;
    }

    [HttpGet("{saId}/identity-document")]
    public async Task<IActionResult> GetId()
    {
        return Ok();
    }
    
    [HttpGet("{saId}/drivers-license")]
    public async Task<IActionResult> GetDriversLicense()
    {
        return Ok();
    }
}