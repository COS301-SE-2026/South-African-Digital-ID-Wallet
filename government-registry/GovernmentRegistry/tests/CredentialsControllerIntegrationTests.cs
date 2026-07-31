using System.Net;
using System.Net.Http.Json;
using Application.Features.Credentials.Dtos;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;

namespace tests;

public class CredentialsControllerIntegrationTests : IClassFixture<GovernmentRegistryWebApplicationFactory>
{
    private readonly GovernmentRegistryWebApplicationFactory _factory;

    public CredentialsControllerIntegrationTests(GovernmentRegistryWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private static CitizenRecord ValidCitizenRecord(string saId) => new()
    {
        Id = Guid.NewGuid(),
        SaId = saId,
        Names = "Thandiwe",
        Surname = "Mokoena",
        Gender = Gender.Female,
        DateOfBirth = new DateOnly(1990, 1, 1),
    };

    private static IdentityDocument ValidIdentityDocument(Guid citizenId) => new()
    {
        Id = Guid.NewGuid(),
        Signature = "test-signature",
        IssuedBy = "Department of Home Affairs",
        IssueDate = new DateOnly(2020, 1, 1),
        CitizenId = citizenId,
        CountryOfBirth = "South Africa",
        CitizenshipStatus = CitizenStatus.Citizen,
        Nationality = "South African",
        PhotoBlob = "base64-photo-data",
    };

    private static DriversLicense ValidDriversLicense(Guid citizenId) => new()
    {
        Id = Guid.NewGuid(),
        Signature = "test-signature",
        IssuedBy = "Road Traffic Management Corporation",
        IssueDate = new DateOnly(2021, 6, 1),
        CitizenId = citizenId,
        LicenseNumber = "DL123456",
        LicenseCode = LicenseCode.B,
        Restrictions = "None",
        ExpiryDate = new DateOnly(2031, 6, 1),
        PhotoBlob = "base64-photo-data",
    };


    [Fact]
    public async Task GetId_NoApiKeyHeader_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/credentials/9001015800083/identity-document", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetId_WrongApiKey_Returns401()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-API-KEY", "wrong-key");

        var response = await client.GetAsync("/api/credentials/9001015800083/identity-document", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetId_IdentityDocumentExists_ReturnsOkWithDocument()
    {
        var citizen = ValidCitizenRecord("9002026800084");
        var document = ValidIdentityDocument(citizen.Id);

        await _factory.SeedAsync(context =>
        {
            context.CitizenRecords.Add(citizen);
            context.IdentityDocuments.Add(document);
        });

        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-API-KEY", GovernmentRegistryWebApplicationFactory.TestApiKey);

        var response = await client.GetAsync("/api/credentials/9002026800084/identity-document", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<IdentityDocumentResponseDto>(TestContext.Current.CancellationToken);
        Assert.NotNull(body);
        Assert.Equal("Department of Home Affairs", body.IssuedBy);
        Assert.Equal("South Africa", body.CountryOfBirth);
    }

    [Fact]
    public async Task GetId_IdentityDocumentNotFound_ReturnsNotFound()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-API-KEY", GovernmentRegistryWebApplicationFactory.TestApiKey);

        var response = await client.GetAsync("/api/credentials/0000000000000/identity-document", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }


    [Fact]
    public async Task GetDriversLicense_NoApiKeyHeader_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/credentials/9001015800083/drivers-license", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetDriversLicense_WrongApiKey_Returns401()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-API-KEY", "wrong-key");

        var response = await client.GetAsync("/api/credentials/9001015800083/drivers-license", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetDriversLicense_DriversLicenseExists_ReturnsOkWithLicense()
    {
        var citizen = ValidCitizenRecord("9003037800085");
        var license = ValidDriversLicense(citizen.Id);

        await _factory.SeedAsync(context =>
        {
            context.CitizenRecords.Add(citizen);
            context.DriversLicenses.Add(license);
        });

        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-API-KEY", GovernmentRegistryWebApplicationFactory.TestApiKey);

        var response = await client.GetAsync("/api/credentials/9003037800085/drivers-license", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<DriversLicenseResponseDto>(TestContext.Current.CancellationToken);
        Assert.NotNull(body);
        Assert.Equal("DL123456", body.LicenseNumber);
        Assert.Equal("Road Traffic Management Corporation", body.IssuedBy);
    }

    [Fact]
    public async Task GetDriversLicense_DriversLicenseNotFound_ReturnsNotFound()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-API-KEY", GovernmentRegistryWebApplicationFactory.TestApiKey);

        var response = await client.GetAsync("/api/credentials/0000000000000/drivers-license", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}