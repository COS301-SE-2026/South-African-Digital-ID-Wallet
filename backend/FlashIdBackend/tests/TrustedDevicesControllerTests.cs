using System.Security.Claims;
using Application.Common.Interfaces.ServiceInterfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Presentation.Controllers;

namespace tests;

public class TrustedDevicesControllerTests
{
    [Fact]
    public async Task GetMyTrustedDevices_WithoutAUserIdClaim_ReturnsUnauthorized()
    {
        // a valid JWT always carries userId, so this guard is only reachable without the HTTP pipeline
        var service = new Mock<ITrustedDeviceService>(MockBehavior.Strict);
        var controller = new TrustedDevicesController(service.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity()) },
            },
        };

        var result = await controller.GetMyTrustedDevices();

        Assert.IsType<UnauthorizedObjectResult>(result);
    }
}
