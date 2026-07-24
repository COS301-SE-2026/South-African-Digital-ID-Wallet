using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.ManageUserAccount.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
}