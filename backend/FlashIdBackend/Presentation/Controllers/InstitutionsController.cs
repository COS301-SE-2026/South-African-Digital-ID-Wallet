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

    /// <summary>
    /// Registers a new institution and assigns it an admin.
    /// </summary>
    /// <param name="request">The institution's registration details.</param>
    /// <response code="201">The institution was created.</response>
    /// <response code="400">The registration request was invalid.</response>
    /// <response code="404">The specified admin was not found.</response>
    /// <response code="409">An institution with these details already exists.</response>
    /// <response code="403">The caller is not a Government Administrator.</response>
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

    /// <summary>
    /// Returns all registered institutions.
    /// </summary>
    /// <response code="200">The list of institutions.</response>
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

    /// <summary>
    /// Returns a single institution by its ID.
    /// </summary>
    /// <param name="institutionId">The institution's unique identifier.</param>
    /// <response code="200">The requested institutions.</response>
    /// <response code="404">No institution exists with the given ID.</response>
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
}