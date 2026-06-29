// using Application.Common.Interfaces.ProviderInterfaces;
// using Microsoft.AspNetCore.Identity;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore.Metadata.Internal;

// namespace Presentation.Controllers;

// public class EmailController : Controller
// {
//     private readonly IEmailSenderProvider _emailSenderProvider;

//     public EmailController(IEmailSenderProvider emailSenderProvider)
//     {
//         _emailSenderProvider = emailSenderProvider;
//     }

//     public async Task<IActionResult> Index()
//     {
//         var receiver = "nathaniel.chisadza@gmail.com";
//         var subject = "Test";
//         var message = "Hello World";

//         await _emailSenderProvider.SendEmailAsync(receiver, subject, message);

//         return View();
//     }

//     public IActionResult Privacy()
//     {
//         return View();
//     }

//     // [ResponseCache(Duration = 0, Location - ResponseCacheLocation.None, NoStore = true)]
// }