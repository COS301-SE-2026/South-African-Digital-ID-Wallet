using Application.Common.Interfaces.ServiceInterfaces;
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

    [Authorize(Roles = "GovernmentAdministrator")]
    [HttpPost("register")]
    public async Task<IActionResult> RegisterInstitution(
        [FromBody] RegisterInstitutionRequestDto request)
    {
        try
        {
            var result = await _institutionService.RegisterInstitutionAsync(request);
            return CreatedAtAction(nameof(RegisterInstitution), new { id = result.InstitutionId }, result);
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

    [Authorize]
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

    [Authorize]
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

    [Authorize(Roles = "GovernmentAdministrator")]
    [HttpPost("{institutionId}/regenerate-key")]
    public async Task<IActionResult> RegenerateApiKey(Guid institutionId)
    {
        try
        {
            var adminIdClaim = User.FindFirst("userId")?.Value;

            if (!Guid.TryParse(adminIdClaim, out var adminId))
                return Unauthorized(new { error = "Unable to identify the requesting administrator." });

            var result = await _institutionService.RegenerateApiKeyAsync(institutionId, adminId);
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