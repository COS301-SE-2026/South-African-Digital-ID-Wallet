using Application.Common.Interfaces.ServiceInterfaces;
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

    /// <summary>
    /// Registers a new citizen account and sends an email verification OTP. Rate-limited to prevent registration abuse.
    /// </summary>
    /// <param name="request">The citizen's registration details.</param>
    /// <response code="201">The account was created.</response>
    /// <response code="400">The registration request was invalid.</response>
    /// <response code="409">An account with this email already exists.</response>
    [HttpPost("register")]
    [EnableRateLimiting("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCitizenRequestDto request)
    {
        try
        {
            var result = await _citizenService.RegisterCitizenAsync(request);
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
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    /// <summary>
    /// Verifies a citizen's email address using the OTP sent during registration.
    /// </summary>
    /// <param name="request">The email and OTP code to verify.</param>
    /// <response code="201">The email was verified.</response>
    /// <response code="400">The OTP was invalid, expired, already used, or too many attempts were made.</response>
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

    /// <summary>
    /// Resends the email verification OTP to a citizen who has not yet verified their emails. Rate-limited to prevent abuse.
    /// </summary>
    /// <param name="request">The email address to resend the OTP to.</param>
    /// <response code="201">A new OTP was sent.</response>
    /// <response code="400">The email is already verified or the request was invalid.</response>
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
