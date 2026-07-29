using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.ManageUserAccount.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Application.Features.ManageUserAccountCard.DTOs;
using Application.Features.ManageUserAccountCard.Exceptions;
using Microsoft.AspNetCore.RateLimiting;

namespace Presentation.Controllers;

[ApiController]
[Authorize]
[Route("api/manage-user-account")]
public class ManageUserAccountController : ControllerBase
{
    private readonly IManageUserAccountService _manageUserAccountService;

    public ManageUserAccountController(
        IManageUserAccountService manageUserAccountService)
    {
        _manageUserAccountService = manageUserAccountService;
    }

    private const string NoCitizenRecordMessage = "You have no credentials linked. To see your information please activate your credentials.";

    private bool TryGetUserId(out Guid userId)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userIdClaim, out userId);
    }

    [HttpGet("me")]
    [ProducesResponseType(typeof(ManageUserAccountDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyAccount()
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var account = await _manageUserAccountService.GetAccountAsync(userId);

        if (account is null)
        {
            return Ok(new { message = NoCitizenRecordMessage });
        }

        return Ok(account);
    }

    [HttpPost("email/verify-password")]
    [EnableRateLimiting("verify-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status423Locked)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> VerifyPassword([FromBody] VerifyPasswordRequestDto req)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        try
        {
            await _manageUserAccountService.VerifyPasswordAsync(userId, req.Password, ipAddress);
            return Ok(new { message = "Password verified" });
        }
        catch (IncorrectPasswordException ipe)
        {
            return UnprocessableEntity(new { error = ipe.Message });
        }
        catch (AccountLockedException ale)
        {
            return StatusCode(StatusCodes.Status423Locked, new { error = ale.Message });
        }
    }

    [HttpPost("email/request-change")]
    [EnableRateLimiting("email-change-request")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> RequestEmailChange([FromBody] RequestEmailChangeRequestDto req)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        try
        {
            await _manageUserAccountService.RequestEmailChangesAsync(userId, req.NewEmail);
            return Ok(new { message = "A verification code has been sent to your new email address" });
        }
        catch (ReauthRequiredException rre)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = rre.Message, code = "REAUTH_REQUIRED" });
        }
        catch (NewEmailTakenException nete)
        {
            return Conflict(new { error = nete.Message });
        }
        catch (InvalidEmailException iee)
        {
            return BadRequest(new { error = iee.Message });
        }
    }

    [HttpPost("email/resend-otp")]
    [EnableRateLimiting("email-change-resend-otp")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ResendEmailChangeOtp()
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        try
        {
            await _manageUserAccountService.ResendEmailChangeOtpAsync(userId);
            return Ok(new { message = "Verification code has been resent." });
        }
        catch (NoPendingEmailChangeException npece)
        {
            return BadRequest(new { error = npece.Message });
        }
        catch (TooManyEmailChangeOtpAttemptsException tmecoae)
        {
            return BadRequest(new { error = tmecoae.Message });
        }
    }

    [HttpPost("email/confirm")]
    [ProducesResponseType(typeof(ManageUserAccountDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> ConfirmEmailChange([FromBody] ConfirmEmailChangeRequestDto req)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        try
        {
            var account = await _manageUserAccountService.ConfirmEmailChangeAsync(userId, req.OTP, ipAddress);
            return account is null ? Ok(new { message = NoCitizenRecordMessage }) : Ok(account);
        }
        catch (NoPendingEmailChangeException npece)
        {
            return BadRequest(new { error = npece.Message });
        }
        catch (EmailChangeOtpExpiredException ecoee)
        {
            return BadRequest(new { error = ecoee.Message });
        }
        catch (TooManyEmailChangeOtpAttemptsException npece)
        {
            return BadRequest(new { error = npece.Message });
        }
        catch (InvalidEmailChangeOtpException iecoe)
        {
            return BadRequest(new { error = iecoe.Message });
        }
        catch (NewEmailTakenException nete)
        {
            return Conflict(new { error = nete.Message });
        }
    }
}