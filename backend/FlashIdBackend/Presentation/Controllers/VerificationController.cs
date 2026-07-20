using Application.Common.Interfaces.ServiceInterfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/citizen-verfication/home-affairs")]
[Authorize(Roles = "Official")]
public class VerificationController
{
    private readonly ICitizenVerificationService _citizenVerificationService;

    public VerificationController(ICitizenVerificationService citizenVerificationService)
    {
        _citizenVerificationService = citizenVerificationService;
    }


}