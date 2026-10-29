using System.Security.Claims;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Credentials.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Presentation.Controllers;

namespace tests;

public class CredentialsControllerTests
{
    private static CredentialsController CreateController(
        Mock<ICredentialService> credentialService,
        Mock<IQrService> qrService,
        string? userId)
    {
        // a principal with or without the userId claim the actions read
        var claims = userId is null ? Array.Empty<Claim>() : new[] { new Claim("userId", userId) };

        // only the credential and QR services are used by these actions
        return new CredentialsController(credentialService.Object, qrService.Object, null!, null!, null!, null!, null!)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test")) },
            },
        };
    }

    [Fact]
    public async Task GetMyCredentials_WithoutAUserIdClaim_ReturnsUnauthorized()
    {
        var controller = CreateController(new Mock<ICredentialService>(MockBehavior.Strict), new Mock<IQrService>(MockBehavior.Strict), userId: null);

        var result = await controller.GetMyCredentials();

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task GetMyCredentials_ReturnsTheCallersCredentials()
    {
        var userId = Guid.NewGuid();
        IEnumerable<CredentialResponseDto> credentials = new List<CredentialResponseDto> { new() };
        var credentialService = new Mock<ICredentialService>(MockBehavior.Strict);
        credentialService.Setup(s => s.GetMyCredentialsAsync(userId)).ReturnsAsync(credentials);
        var controller = CreateController(credentialService, new Mock<IQrService>(MockBehavior.Strict), userId.ToString());

        var result = await controller.GetMyCredentials();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Same(credentials, ok.Value);
    }

    [Fact]
    public async Task GetMyCredentials_WhenTheServiceFails_LetsTheExceptionReachTheGlobalHandler()
    {
        var userId = Guid.NewGuid();
        var credentialService = new Mock<ICredentialService>(MockBehavior.Strict);
        credentialService.Setup(s => s.GetMyCredentialsAsync(userId)).ThrowsAsync(new InvalidOperationException("boom"));
        var controller = CreateController(credentialService, new Mock<IQrService>(MockBehavior.Strict), userId.ToString());

        // no catch-all any more, so GlobalExceptionHandler can log and map it
        await Assert.ThrowsAsync<InvalidOperationException>(() => controller.GetMyCredentials());
    }

    [Fact]
    public async Task GetMyCredentialSummaries_WithoutAUserIdClaim_ReturnsUnauthorized()
    {
        var controller = CreateController(new Mock<ICredentialService>(MockBehavior.Strict), new Mock<IQrService>(MockBehavior.Strict), userId: null);

        var result = await controller.GetMyCredentialSummaries();

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task GetMyCredentialSummaries_ReturnsTheCallersSummaries()
    {
        var userId = Guid.NewGuid();
        var summaries = new List<CredentialSummaryDto> { new() };
        var qrService = new Mock<IQrService>(MockBehavior.Strict);
        qrService.Setup(s => s.GetMyCredentialsAsync(userId)).ReturnsAsync(summaries);
        var controller = CreateController(new Mock<ICredentialService>(MockBehavior.Strict), qrService, userId.ToString());

        var result = await controller.GetMyCredentialSummaries();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Same(summaries, ok.Value);
    }

    [Fact]
    public async Task SearchCitizens_PassesTheQueryAndPagingToTheService()
    {
        var response = new SearchCitizensResponseDto();
        var credentialService = new Mock<ICredentialService>(MockBehavior.Strict);
        credentialService.Setup(s => s.SearchCitizensAsync("thandi", 2, 10)).ReturnsAsync(response);
        var controller = CreateController(credentialService, new Mock<IQrService>(MockBehavior.Strict), Guid.NewGuid().ToString());

        var result = await controller.SearchCitizens("thandi", 2, 10);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Same(response, ok.Value);
    }
}
