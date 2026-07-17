using Application.Common.Interfaces.ServiceInterfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/credentials")]
[Authorize(Roles = "Citizen")]

public class CredentialsController : ControllerBase
{
    private readonly ICredentialService _credentialService;

    public CredentialsController(ICredentialService credentialService)
    {
        _credentialService = credentialService;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyCredentials()
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null)
            {
                return Unauthorized(new { error = "Invalid token." });
            }

            var userId = Guid.Parse(userIdClaim);
            var result = await _credentialService.GetMyCredentialsAsync(userId);
            return Ok(result);
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occured." });
        }
    }
}