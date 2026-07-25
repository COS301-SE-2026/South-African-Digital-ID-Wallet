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

    [HttpGet("me")]
    [ProducesResponseType(typeof(ManageUserAccountDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ManageUserAccountDto>> GetMyAccount()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var account = await _manageUserAccountService.GetAccountAsync(userId);

        if (account is null)
        {
            return NotFound();
        }

        return Ok(account);
    }

    [HttpPost("email/verify-password")]
    [EnableRateLimiting("verify-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status423Locked)]
    public async Task<IActionResult> VerifyPassword([FromBody] VerifyPasswordRequestDto req)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        try
        {
            await _manageUserAccountService.VerifyPasswordAsync(userId, req.Password, ipAddress);
            return Ok(new { message = "Password verified" });
        }
        catch (IncorrectPasswordException ipe)
        {
            return Unauthorized(new { error = ipe.Message });
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
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> RequestEmailChange([FromBody] RequestEmailChangeRequestDto req)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        try
        {
            await _manageUserAccountService.RequestEmailChangesAsync(userId, req.NewEmail);
            return Ok(new { message = "A verification code has been sent to your new email address" });
        }
        catch (ReauthRequiredException rre)
        {
            return Unauthorized(new { error = rre.Message, code = "REAUTH_REQUIRED" });
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
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        try
        {
            await _manageUserAccountService.ResendEmailChangeOtpAsync(userId);
            return Ok(new { message = "Verification code has been resent." });
        }
        catch (NoPendingEmailChangeException npece)
        {
            return BadRequest(new { error = npece.Message });
        }
    }

    [HttpPost("email/confirm")]
    [ProducesResponseType(typeof(ManageUserAccountDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ManageUserAccountDto>> ConfirmEmailChange([FromBody] ConfirmEmailChangeRequestDto req)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        try
        {
            var account = await _manageUserAccountService.ConfirmEmailChangeAsync(userId, req.OTP, ipAddress);
            return account is null ? NotFound() : Ok(account);
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