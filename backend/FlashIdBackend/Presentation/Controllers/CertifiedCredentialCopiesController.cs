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

    private const long MaxPdfFileSize = 10 * 1024 * 1024;

    public CertifiedCredentialCopiesController(ICertifiedCredentialCopyService certifiedCopyService)
    {
        _certifiedCopyService = certifiedCopyService;
    }

    [Authorize(Roles = "Citizen")]
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

    [AllowAnonymous]
    [HttpGet("verify/{verificationToken}")]
    public async Task<IActionResult> VerifyCertifiedCopy(string verificationToken)
    {
        try
        {
            var result = await _certifiedCopyService.VerifyAsync(verificationToken);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [AllowAnonymous]
    [HttpPost("verify-document/{verificationToken}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> VerifyCertifiedCopyDocument(string verificationToken, IFormFile document)
    {
        try
        {
            if (document is null || document.Length == 0)
            {
                return BadRequest(new
                {
                    message = "A PDF document is required."
                });
            }

            if (document.Length > MaxPdfFileSize)
            {
                return BadRequest(new
                {
                    message = "The PDF document exceeds the maximum allowed size of 10 MB."
                });
            }

            await using var memoryStream = new MemoryStream();

            await document.CopyToAsync(memoryStream);

            var documentBytes = memoryStream.ToArray();

            var hasPdfSignature =
                documentBytes.Length >= 5 &&
                documentBytes[0] == (byte)'%' &&
                documentBytes[1] == (byte)'P' &&
                documentBytes[2] == (byte)'D' &&
                documentBytes[3] == (byte)'F' &&
                documentBytes[4] == (byte)'-';

            if (!hasPdfSignature)
            {
                return BadRequest(new
                {
                    message = "Only PDF documents are supported."
                });
            }

            var result = await _certifiedCopyService.VerifyDocumentAsync(verificationToken, documentBytes);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

}