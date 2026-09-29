using Application.Common.Interfaces.ServiceInterfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Presentation.Controllers;

[ApiController]
[Route("api/account")]
[Authorize]
public class DeleteAccountController : ControllerBase
{
    private readonly IDeleteAccountService _deleteAccountService;

    public DeleteAccountController(IDeleteAccountService deleteAccountService)
    {
        _deleteAccountService = deleteAccountService;
    }


    [HttpDelete]
    public async Task<IActionResult> DeleteAccount()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userIdClaim))
        {
            return Unauthorized();
        }

        var userId = Guid.Parse(userIdClaim);

        await _deleteAccountService.DeleteAccountAsync(userId);

        return NoContent();
    }
}