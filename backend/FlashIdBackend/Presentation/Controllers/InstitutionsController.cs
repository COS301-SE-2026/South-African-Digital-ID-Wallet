using Application.Common.Interfaces;
using Application.Features.Institutions.DTOs;
using Application.Features.Institutions.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/institutions")]
[Authorize(Roles = "GovernmentAdministrator")]
public class InstitutionsController : ControllerBase
{
    private readonly IInstitutionService _institutionService;

    public InstitutionsController(IInstitutionService institutionService)
    {
        _institutionService = institutionService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> RegisterInstitution(
        [FromBody] RegisterInstitutionRequestDto request
    )
    {
        try
        {
            var result = await _institutionService.RegisterInstitutionAsync(request);
            return CreatedAtAction(
                nameof(RegisterInstitution),
                new { id = result.InstitutionId },
                result
            );
        }
        catch (InvalidInstitutionRequestException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (AdminNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InstitutionAlreadyExistsException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllInstitutions()
    {
        try
        {
            var result = await _institutionService.GetAllInstitutionsAsync();
            return Ok(result);
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    [HttpGet("{institutionId}")]
    public async Task<IActionResult> GetInstitutionById(Guid institutionId)
    {
        try
        {
            var result = await _institutionService.GetInstitutionByIdAsync(institutionId);
            return Ok(result);
        }
        catch (InvalidInstitutionRequestException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

}