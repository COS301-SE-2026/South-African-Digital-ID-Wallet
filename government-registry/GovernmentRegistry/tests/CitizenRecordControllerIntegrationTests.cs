using System.Net;
using System.Net.Http.Json;
using Application.Features.Citizens.Dtos;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;

namespace tests;

public class CitizenRecordControllerIntegrationTests : IClassFixture<GovernmentRegistryWebApplicationFactory>
{
    private readonly GovernmentRegistryWebApplicationFactory _factory;

    public CitizenRecordControllerIntegrationTests(GovernmentRegistryWebApplicationFactory factory)
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

    [Fact]
    public async Task GetCitizenById_NoApiKeyHeader_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/citizens/9001015800083", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetCitizenById_WrongApiKey_Returns401()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-API-KEY", "wrong-key");

        var response = await client.GetAsync("/api/citizens/9001015800083", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetCitizenById_CitizenExists_ReturnsOkWithCitizen()
    {
        await _factory.SeedAsync(context =>
        {
            context.CitizenRecords.Add(ValidCitizenRecord("9002026800084"));
        });

        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-API-KEY", GovernmentRegistryWebApplicationFactory.TestApiKey);

        var response = await client.GetAsync("/api/citizens/9002026800084", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<CitizenRecordResponseDto>(TestContext.Current.CancellationToken);
        Assert.NotNull(body);
        Assert.Equal("Thandiwe", body.Names);
    }

    [Fact]
    public async Task GetCitizenById_CitizenNotFound_ReturnsNotFound()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-API-KEY", GovernmentRegistryWebApplicationFactory.TestApiKey);

        var response = await client.GetAsync("/api/citizens/0000000000000", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}