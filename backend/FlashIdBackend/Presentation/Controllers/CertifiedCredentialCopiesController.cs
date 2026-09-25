using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Credentials.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Domain.Entities;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Presentation.Controllers;

[ApiController]
[Route("api/certified-copies")]
public class CertifiedCredentialCopiesController : ControllerBase
{
    private readonly ICertifiedCredentialCopyService _certifiedCopyService;

    public CertifiedCredentialCopiesController(ICertifiedCredentialCopyService certifiedCopyService)
    {
        _certifiedCopyService = certifiedCopyService;
    }

    [Authorize(Roles = "citizen")]
    [HttpPost("credentials/{credentialId:guid}")]
    public async Task<IActionResult> GenerateCertifiedCopy(Guid credentialId)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new
                {
                    message = "Invalid authenticated user."
                });
            }

            var result = await _certifiedCopyService.GenerateAsync(credentialId, userId);

            return File(result.PdfBytes, "application/pdf", result.FileName);
        }
        catch (CredentialNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (CredentialAccessDeniedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = ex.Message
            });
        }
        catch (CredentialNotActiveException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = ex.Message
            });
        }
    }

}