using System.Net;
using System.Text;
using Infrastructure.Providers;
using Microsoft.Extensions.Configuration;

namespace tests;

public class IpGeolocationProviderTests
{
    private class FakeHttpMessageHandler : HttpMessageHandler
    {
        private readonly HttpResponseMessage _response;
        public FakeHttpMessageHandler(HttpResponseMessage response)
        {
            _response = response;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            return Task.FromResult(_response);
        }
    }

    private static IConfiguration CreateConfiguration()
    {
        return new ConfigurationBuilder().AddInMemoryCollection
            (new Dictionary<string, string?>
            {
                ["IpGeolocation:ApiKey"] = "test-api-key",
            }).Build();
    }

    [Fact]
    public async Task GetLocationAsync_ValidResponse_ReturnsCityAndCountry()
    {
        var json =
            """
             {
                "ip" : "192.25.1.1",
                "location" : {
                    "city" : "Johannesburg",
                    "country_name" : "South Africa"
                }
             }
            """;

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };

        var handler = new FakeHttpMessageHandler(response);

        var httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api.ipgeolocation.io/v3/ipgeo")
        };

        var provider = new IpGeolocationProvider(httpClient, CreateConfiguration());

        var result = await provider.GetLocationAsync("192.25.1.1", CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("Johannesburg", result.City);
        Assert.Equal("South Africa", result.Country);
    }

    [Fact]
    public async Task GetLocationAsync_ApiFailure_ReturnsNull()
    {
        var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
        var handler = new FakeHttpMessageHandler(response);
        var httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api.ipgeolocation.io/v3/ipgeo")
        };
        var provider = new IpGeolocationProvider(httpClient, CreateConfiguration());
        var result = await provider.GetLocationAsync("192.25.1.1", CancellationToken.None);
        Assert.Null(result);
    }

    [Fact]
    public async Task GetLocationAsync_ResponseWithoutLocation_ReturnsNull()
    {
        var json =
            """
             {
                "ip" : "192.25.1.1"
             }
            """;

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        var handler = new FakeHttpMessageHandler(response);
        var httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api.ipgeolocation.io/v3/ipgeo")
        };
        var provider = new IpGeolocationProvider(httpClient, CreateConfiguration());
        var result = await provider.GetLocationAsync("192.25.1.1", CancellationToken.None);
        Assert.Null(result);
    }

    [Fact]
    public async Task GetLocationAsync_MissingApiKey_ThrowsInvalidOperationException()
    {
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>()).Build();
        var response = new HttpResponseMessage(HttpStatusCode.OK);
        var handler = new FakeHttpMessageHandler(response);
        var httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api.ipgeolocation.io/v3/ipgeo")
        };
        var provider = new IpGeolocationProvider(httpClient, configuration);
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => provider.GetLocationAsync("192.25.1.1", CancellationToken.None));
        Assert.Equal("IP Geolocation API key is missing", exception.Message);
    }

    [Fact]
    public async Task GetLocationAsync_NullJsonResponse_ReturnsNull()
    {
        var response = new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent("null", Encoding.UTF8, "application/json") };
        var handler = new FakeHttpMessageHandler(response);
        var httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api.ipgeolocation.io/v3/ipgeo")
        };
        var provider = new IpGeolocationProvider(httpClient, CreateConfiguration());
        var result = await provider.GetLocationAsync("192.25.1.1", CancellationToken.None);
        Assert.Null(result);
    }
}