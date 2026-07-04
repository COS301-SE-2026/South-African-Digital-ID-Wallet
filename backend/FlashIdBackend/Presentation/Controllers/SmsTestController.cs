using Application.Common.Interfaces.ProviderInterfaces;
using Infrastructure.Providers;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("sms")]
public class SmsTestController : ControllerBase
{
    private readonly ISmsProvider _smsPortalProvider;

    public SmsTestController(ISmsProvider smsPortalProvider)
    {
        _smsPortalProvider = smsPortalProvider;
    }

    [HttpPost("test-sms")]
    public async Task<IActionResult> SendTestSms([FromBody] string number)
    {
        await _smsPortalProvider.SendSmsAsync(number, "FlashID test SMS is working :)");

        return Ok("SMS sent");
    }
}