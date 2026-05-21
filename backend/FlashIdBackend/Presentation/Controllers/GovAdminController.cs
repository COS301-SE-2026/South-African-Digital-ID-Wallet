using Application.Common.Interfaces;
using Application.Features.GovernmentAdministrators.DTOs;
using Application.Features.GovernmentAdministrators.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/gov-admin")]
public class GovAdminController : ControllerBase
{
    private readonly IGovAdminService _govAdminService;

    public GovAdminController(IGovAdminService govAdminService)
    {
        _govAdminService = govAdminService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterGovAdminRequestDto request)
    {
        try
        {
            var result = await _govAdminService.RegisterGovAdminAsync(request);
            return CreatedAtAction(nameof(Register), new { id = result.GovAdminId }, result);
        }
        catch (InvalidGovAdminRequestException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (GovAdminAlreadyExistsException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (GovAdminEmailTakenException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (GovAdminUsernameTakenException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }
}
