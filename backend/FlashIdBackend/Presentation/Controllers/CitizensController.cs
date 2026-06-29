using Application.Common.Interfaces;
using Application.Features.Citizens.DTOs;
using Application.Features.Citizens.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

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
    [EnableRateLimiting("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCitizenRequestDto request)
    {
        try
        {
            var result = await _citizenService.RegisterCitizenAsync(request);
            // return Ok(result);
            // return CreatedAtAction(nameof(Register), new { id = result.UserId }, result);
            return StatusCode(StatusCodes.Status201Created, result);
        }
        catch (InvalidCitizenRegistrationRequestException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (EmailTakenException ete)
        {
            return Conflict(new { error = ete.Message });
        }
        // catch (CitizenNotFoundException ex)
        // {
        //     return NotFound(new { error = ex.Message });
        // }
        // catch (CitizenAlreadyActivatedException ex)
        // {
        //     return Conflict(new { error = ex.Message });
        // }
        // catch (InvalidActivationCodeException ex)
        // {
        //     return BadRequest(new { error = ex.Message });
        // }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequestDto request)
    {
        try
        {
            await _citizenService.VerifyEmailAsync(request);
            return Ok(new { message = "Email verified successfully." });
        }
        catch (InvalidOtpException ioe)
        {
            return BadRequest(new { error = ioe.Message });
        }
        catch (OtpExpiredException oee)
        {
            return BadRequest(new { error = oee.Message });
        }
        catch (TooManyOtpAttemptsException tmoae)
        {
            return BadRequest(new { error = tmoae.Message });
        }
        catch (EmailAlreadyVerifiedException eave)
        {
            return BadRequest(new { error = eave.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occured." });
        }
    }

    [HttpPost("resend-otp")]
    [EnableRateLimiting("resend-otp")]
    public async Task<IActionResult> ResendOtp([FromBody] ResendOtpRequestDto request)
    {
        try
        {
            await _citizenService.ResendOtpAsync(request);
            return Ok(new { message = "Verificaiton code has been resent." });
        }
        catch (EmailAlreadyVerifiedException eave)
        {
            return BadRequest(new { error = eave.Message });
        }
        catch (InvalidCitizenRegistrationRequestException icrre)
        {
            return BadRequest(new { error = icrre.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occured." });
        }
    }
}
