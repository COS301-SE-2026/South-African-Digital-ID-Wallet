using System.Text.Json;
using Application.Features.Citizens.Exceptions;
using Application.Features.Credentials.Enums;
using Application.Features.Credentials.Exceptions;
using Application.Features.GovAdminAuditLog.Exceptions;
using Application.Features.Onboarding.Exceptions;
using Application.Features.Verification.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging.Abstractions;
using Presentation.ExceptionHandling;

namespace tests;

public class GlobalExceptionHandlerTests
{
    private const string TestSaId = "9001015800085";
    private const string RequestPath = "/api/credentials/issue";

    private sealed class FakeHostEnvironment : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = Environments.Production;
        public string ApplicationName { get; set; } = "tests";
        public string ContentRootPath { get; set; } = Directory.GetCurrentDirectory();
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }

    private static GlobalExceptionHandler CreateHandler(string? environmentName = null) =>
        new(NullLogger<GlobalExceptionHandler>.Instance,
            new FakeHostEnvironment { EnvironmentName = environmentName ?? Environments.Production });

    private static DefaultHttpContext CreateContext()
    {
        var context = new DefaultHttpContext
        {
            TraceIdentifier = "trace-id-for-tests",
        };

        context.Request.Method = HttpMethods.Post;
        context.Request.Path = RequestPath;
        context.Response.Body = new MemoryStream();

        return context;
    }

    private static async Task<JsonElement> ReadProblemAsync(HttpContext context)
    {
        context.Response.Body.Position = 0;
        using var document = await JsonDocument.ParseAsync(
            context.Response.Body,
            cancellationToken: TestContext.Current.CancellationToken);

        return document.RootElement.Clone();
    }

    public static IEnumerable<object[]> MappedExceptions()
    {
        yield return new object[] { new IdentityRecordNotFoundException(), StatusCodes.Status404NotFound, "Identity record not found" };
        yield return new object[] { new CitizenConsentRequiredException(), StatusCodes.Status400BadRequest, "Consent Required" };
        yield return new object[] { new DuplicateIdRegisteredException(), StatusCodes.Status409Conflict, "Citizen already onboarded" };
        yield return new object[] { new InvalidSAPhoneNumberException(), StatusCodes.Status422UnprocessableEntity, "Invalid SA phone number format" };
        yield return new object[] { new InvalidAuditActionException("NotAnAction"), StatusCodes.Status400BadRequest, "Invalid audit action" };
        yield return new object[] { new DuplicateEmailRegisteredException(), StatusCodes.Status409Conflict, "Email already registered" };
        yield return new object[] { new Application.Features.Citizens.Exceptions.CitizenNotFoundException(TestSaId), StatusCodes.Status404NotFound, "Citizen not found" };
        yield return new object[] { new Application.Features.Credentials.Exceptions.CitizenNotFoundException(Guid.NewGuid()), StatusCodes.Status404NotFound, "Citizen not found" };
        yield return new object[] { new CitizenNotOnboardedException(TestSaId), StatusCodes.Status409Conflict, "Citizen not activated" };
        yield return new object[] { new CredentialAlreadyIssuedException(TestSaId, CredentialType.IdentityDocument), StatusCodes.Status409Conflict, "Credential already issued" };
        yield return new object[] { new GovernmentRegistryRecordNotFoundException(TestSaId, CredentialType.DriversLicense), StatusCodes.Status404NotFound, "Government registry record not found" };
        yield return new object[] { new GovernmentRegistryDataInvalidException(TestSaId, "Gender", "??"), StatusCodes.Status502BadGateway, "Government registry record invalid data" };
        yield return new object[] { new EmailDeliveryException(), StatusCodes.Status503ServiceUnavailable, "Required value missing" };
        yield return new object[] { new VerificationExpiredException(), StatusCodes.Status410Gone, "Verification session expired" };
        yield return new object[] { new VerificationNotFoundException(), StatusCodes.Status404NotFound, "Verification session not found" };
        yield return new object[] { new InvalidVerificationState("Cannot continue."), StatusCodes.Status409Conflict, "Verification cannot continue" };
        yield return new object[] { new ArgumentNullException("param"), StatusCodes.Status400BadRequest, "Invalid request" };
        yield return new object[] { new ArgumentOutOfRangeException("param"), StatusCodes.Status400BadRequest, "Value outside allowed range" };
        yield return new object[] { new ArgumentException("Bad argument."), StatusCodes.Status400BadRequest, "Invalid request." };
    }

    [Theory]
    [MemberData(nameof(MappedExceptions))]
    public async Task TryHandleAsync_MapsKnownExceptionToItsStatusAndTitle(
        Exception exception,
        int expectedStatus,
        string expectedTitle)
    {
        var handler = CreateHandler();
        var context = CreateContext();

        var handled = await handler.TryHandleAsync(context, exception, TestContext.Current.CancellationToken);

        Assert.True(handled);
        Assert.Equal(expectedStatus, context.Response.StatusCode);

        var problem = await ReadProblemAsync(context);
        Assert.Equal(expectedStatus, problem.GetProperty("status").GetInt32());
        Assert.Equal(expectedTitle, problem.GetProperty("title").GetString());
    }

    [Theory]
    [MemberData(nameof(MappedExceptions))]
    public async Task TryHandleAsync_ForKnownExceptions_SurfacesTheOriginalMessageAsDetail(
        Exception exception,
        int expectedStatus,
        string expectedTitle)
    {
        _ = expectedStatus;
        _ = expectedTitle;

        var handler = CreateHandler();
        var context = CreateContext();

        await handler.TryHandleAsync(context, exception, TestContext.Current.CancellationToken);

        var problem = await ReadProblemAsync(context);
        Assert.Equal(exception.Message, problem.GetProperty("detail").GetString());
    }

    [Fact]
    public async Task TryHandleAsync_AlwaysReportsTheRequestPathAndTraceId()
    {
        var handler = CreateHandler();
        var context = CreateContext();

        await handler.TryHandleAsync(context, new VerificationNotFoundException(), TestContext.Current.CancellationToken);

        var problem = await ReadProblemAsync(context);
        Assert.Equal(RequestPath, problem.GetProperty("instance").GetString());
        Assert.Equal("trace-id-for-tests", problem.GetProperty("traceId").GetString());
    }

    [Fact]
    public async Task TryHandleAsync_WithAnUnmappedException_ReturnsFiveHundred()
    {
        var handler = CreateHandler();
        var context = CreateContext();

        var handled = await handler.TryHandleAsync(
            context, new InvalidOperationException("boom"), TestContext.Current.CancellationToken);

        Assert.True(handled);
        Assert.Equal(StatusCodes.Status500InternalServerError, context.Response.StatusCode);

        var problem = await ReadProblemAsync(context);
        Assert.Equal("Internal server error", problem.GetProperty("title").GetString());
    }

    [Fact]
    public async Task TryHandleAsync_WithAnUnmappedExceptionInProduction_HidesTheInternalMessage()
    {
        var handler = CreateHandler(Environments.Production);
        var context = CreateContext();

        await handler.TryHandleAsync(
            context, new InvalidOperationException("connection string leaked here"), TestContext.Current.CancellationToken);

        var problem = await ReadProblemAsync(context);
        var detail = problem.GetProperty("detail").GetString();

        Assert.Equal("An unexpected server error occurred.", detail);
        Assert.DoesNotContain("connection string leaked here", detail);
    }

    [Fact]
    public async Task TryHandleAsync_WithAnUnmappedExceptionInDevelopment_ExposesTheMessageForDebugging()
    {
        var handler = CreateHandler(Environments.Development);
        var context = CreateContext();

        await handler.TryHandleAsync(
            context, new InvalidOperationException("boom"), TestContext.Current.CancellationToken);

        var problem = await ReadProblemAsync(context);
        Assert.Equal("boom", problem.GetProperty("detail").GetString());
    }

    [Fact]
    public async Task TryHandleAsync_PrefersTheMostSpecificMatchForArgumentExceptionSubclasses()
    {
        var handler = CreateHandler();

        var nullContext = CreateContext();
        await handler.TryHandleAsync(nullContext, new ArgumentNullException("p"), TestContext.Current.CancellationToken);
        var nullProblem = await ReadProblemAsync(nullContext);

        var rangeContext = CreateContext();
        await handler.TryHandleAsync(rangeContext, new ArgumentOutOfRangeException("p"), TestContext.Current.CancellationToken);
        var rangeProblem = await ReadProblemAsync(rangeContext);

        Assert.Equal("Invalid request", nullProblem.GetProperty("title").GetString());
        Assert.Equal("Value outside allowed range", rangeProblem.GetProperty("title").GetString());



    }
}
