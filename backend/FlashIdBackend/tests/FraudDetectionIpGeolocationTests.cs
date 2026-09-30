using System.Net;
using System.Text;
using Infrastructure.Providers;
using Microsoft.Extensions.Configuration;

namespace tests;

public class FraudDetectionIpGeolocationTests
{
    private sealed class FakeHttpMessageHandler(string json) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) =>
            Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json"),
            });
    }

    private static IpGeolocationProvider CreateProvider(string json)
    {
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["IpGeolocation:ApiKey"] = "test-api-key",
        }).Build();

        var httpClient = new HttpClient(new FakeHttpMessageHandler(json))
        {
            BaseAddress = new Uri("https://api.ipgeolocation.io/v2/ipgeo"),
        };

        return new IpGeolocationProvider(httpClient, configuration);
    }

    [Fact]
    public async Task GetLocationAsync_StringCoordinates_AreParsed()
    {
        var provider = CreateProvider("""
            { "location": { "city": "Johannesburg", "country_name": "South Africa", "latitude": "-26.20410", "longitude": "28.04731" } }
            """);

        var result = await provider.GetLocationAsync("41.0.0.1", TestContext.Current.CancellationToken);

        Assert.Equal(-26.2041, result!.Latitude);
        Assert.Equal(28.04731, result.Longitude);
    }

    [Fact]
    public async Task GetLocationAsync_NumericCoordinates_AreParsed()
    {
        var provider = CreateProvider("""
            { "location": { "city": "London", "country_name": "United Kingdom", "latitude": 51.5074, "longitude": -0.1278 } }
            """);

        var result = await provider.GetLocationAsync("81.2.69.160", TestContext.Current.CancellationToken);

        Assert.Equal(51.5074, result!.Latitude);
        Assert.Equal(-0.1278, result.Longitude);
    }

    [Fact]
    public async Task GetLocationAsync_MissingOrInvalidCoordinates_AreNull()
    {
        var provider = CreateProvider("""
            { "location": { "city": "Durban", "country_name": "South Africa", "latitude": "not-a-number" } }
            """);

        var result = await provider.GetLocationAsync("41.0.0.2", TestContext.Current.CancellationToken);

        Assert.Equal("Durban", result!.City);
        Assert.Null(result.Latitude);
        Assert.Null(result.Longitude);
    }
}
