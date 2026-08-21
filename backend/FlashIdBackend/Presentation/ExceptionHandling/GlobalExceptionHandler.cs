using Application.Features.Onboarding.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Diagnostics;
using Application.Features.Citizens.Exceptions;
using Application.Features.Credentials.Exceptions;

namespace Presentation.ExceptionHandling;

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IHostEnvironment environment) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (status, title, detail) = exception switch
        {
            IdentityRecordNotFoundException =>
                (StatusCodes.Status404NotFound, "Identity record not found",
                exception.Message),

            CitizenConsentRequiredException =>
                (StatusCodes.Status400BadRequest, "Consent Required",
                    exception.Message),

            DuplicateIdRegisteredException =>
                (StatusCodes.Status409Conflict, "Citizen already onboarded",
                exception.Message),

            InvalidSAPhoneNumberException =>
                (StatusCodes.Status422UnprocessableEntity, "Invalid SA phone number format",
                    exception.Message),

            DuplicateEmailRegisteredException =>
                (StatusCodes.Status409Conflict, "Email already registered",
                    exception.Message),

            CitizenNotFoundException =>
                (StatusCodes.Status404NotFound, "Citizen not found",
                    exception.Message),

            CitizenNotOnboardedException =>
                (StatusCodes.Status409Conflict, "Citizen not activated",
                    exception.Message),

            CredentialAlreadyIssuedException =>
                (StatusCodes.Status409Conflict, "Credential already issued",
                    exception.Message),

            GovernmentRegistryRecordNotFoundException =>
                (StatusCodes.Status404NotFound, "Government registry record not found",
                    exception.Message),

            EmailDeliveryException => (StatusCodes.Status503ServiceUnavailable, "Required value missing",
                    exception.Message),

            ArgumentNullException => (StatusCodes.Status400BadRequest, "Invalid request",
                exception.Message),

            ArgumentOutOfRangeException => (StatusCodes.Status400BadRequest, "Value outside allowed range",
                exception.Message),

            ArgumentException => (StatusCodes.Status400BadRequest, "Invalid request.",
                exception.Message),

            _ => (StatusCodes.Status500InternalServerError, "Internal server error",
                    environment.IsDevelopment() ? exception.Message : "An unexpected server error occurred.")
        };

        if (status >= 500)
        {
            logger.LogError(exception, "Request failed: {Method} {Path}. TraceId: {TraceId}", httpContext.Request.Method, httpContext.Request.Path, httpContext.TraceIdentifier);
        }
        else
        {
            logger.LogWarning(exception, "Request rejected: {Method} {Path}. TraceId: {TraceId}", httpContext.Request.Method, httpContext.Request.Path, httpContext.TraceIdentifier);
        }

        var problem = new ProblemDetails()
        {
            Status = status,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        };

        problem.Extensions["traceId"] = httpContext.TraceIdentifier;

        httpContext.Response.StatusCode = status;
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);

        return true;
    }

}

public class EmailDeliveryException : Exception
{
    public EmailDeliveryException() :
    base("The notification could not be delivered at this time.")
    {
    }
}