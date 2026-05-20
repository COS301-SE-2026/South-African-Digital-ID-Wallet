using Application.Common.Interfaces;
using Application.Features.Citizens.DTOs;
using Application.Features.Citizens.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/citizens")]
public class CitizensController : ControllerBase
{
    private readonly ICitizenService _citizenService;

    public CitizensController(ICitizenService citizenService)
    {
        _citizenService = citizenService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCitizenRequestDto request)
    {
        try
        {
            var result = await _citizenService.RegisterCitizenAsync(request);
            return CreatedAtAction(nameof(Register), new { id = result.CitizenId }, result);
        }
        catch (InvalidCitizenRegistrationRequestException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (CitizenNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (CitizenAlreadyActivatedException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (InvalidActivationCodeException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (ActivationCodeExpiredException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (UsernameTakenException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }
}
