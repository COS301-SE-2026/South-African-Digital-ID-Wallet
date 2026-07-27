using System.Net;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/credentials")]
public class CredentialsController : ControllerBase
{
    private ICredentialsService _credentialsService;
    public CredentialsController(ICredentialsService credentialsService)
    {
        _credentialsService = credentialsService;
    }

    [HttpGet("{saId}/identity-document")]
    public async Task<IActionResult> GetId(string saId, CancellationToken cancellationToken)
    {
        var id = await _credentialsService.GetIdentityDocumentAsync(saId, cancellationToken);
        if (id is null)
        {
            return NotFound(new { message = "Identity document not found" });
        }
        return Ok(id);
    }

    [HttpGet("{saId}/drivers-license")]
    public async Task<IActionResult> GetDriversLicense(string saId, CancellationToken cancellationToken)
    {
        var driversLicense = await _credentialsService.GetDriversLicenseAsync(saId, cancellationToken);
        if (driversLicense is null)
        {
            return NotFound(new { message = "Drivers License not found" });
        }
        return Ok(driversLicense);
    }
}