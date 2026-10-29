using System.Security.Claims;
using System.Text.Json;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.ManageUserAccount.DTOs;
using Application.Features.ManageUserAccountCard.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Presentation.Controllers;

namespace tests;

public class ManageUserAccountControllerTests
{
    private static ManageUserAccountController CreateController(Mock<IManageUserAccountService> service, Guid userId) =>
        new(service.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) }, "Test")),
                },
            },
        };

    // the dashboard keys off this flag, so an unlinked account must always send linked: false
    private static void AssertUnlinked(IActionResult result)
    {
        var ok = Assert.IsType<OkObjectResult>(result);
        var body = JsonSerializer.SerializeToElement(ok.Value);
        Assert.False(body.GetProperty("linked").GetBoolean());
        Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("message").GetString()));
    }

    [Fact]
    public async Task GetMyAccount_WithNoLinkedCitizen_FlagsTheResponseAsUnlinked()
    {
        var userId = Guid.NewGuid();
        var service = new Mock<IManageUserAccountService>(MockBehavior.Strict);
        service.Setup(s => s.GetAccountAsync(userId)).ReturnsAsync((ManageUserAccountDto?)null);

        var result = await CreateController(service, userId).GetMyAccount();

        AssertUnlinked(result);
    }

    [Fact]
    public async Task ConfirmEmailChange_WithNoLinkedCitizen_FlagsTheResponseAsUnlinked()
    {
        var userId = Guid.NewGuid();
        var service = new Mock<IManageUserAccountService>(MockBehavior.Strict);
        service.Setup(s => s.ConfirmEmailChangeAsync(userId, "123456", It.IsAny<string>())).ReturnsAsync((ManageUserAccountDto?)null);

        var result = await CreateController(service, userId).ConfirmEmailChange(new ConfirmEmailChangeRequestDto { OTP = "123456" });

        AssertUnlinked(result);
    }
}
