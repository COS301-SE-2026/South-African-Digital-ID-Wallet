using System.Globalization;
using Application.Features.FraudDetection.DTOs;
using Domain.Enums;

namespace Presentation.Security;

public static class SecurityEventContextFactory
{
    public const string DeviceHeaderName = "X-Device-Token";
    public const string DeviceCookieName = "flashid_device";
    public const string LatitudeHeaderName = "X-Geo-Latitude";
    public const string LongitudeHeaderName = "X-Geo-Longitude";

    public static SecurityEventContext Create(HttpContext httpContext, Guid userId, SecurityEventType eventType, string? deviceToken = null)
    {
        var request = httpContext.Request;

        return new SecurityEventContext
        {
            UserId = userId,
            EventType = eventType,
            IpAddress = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            DeviceToken = string.IsNullOrWhiteSpace(deviceToken) ? ReadDeviceToken(request) : deviceToken,
            UserAgent = request.Headers.UserAgent.ToString(),
            ClientLatitude = ReadCoordinate(request, LatitudeHeaderName),
            ClientLongitude = ReadCoordinate(request, LongitudeHeaderName),
        };
    }

    public static string? ReadDeviceToken(HttpRequest request)
    {
        if (request.Headers.TryGetValue(DeviceHeaderName, out var header) && !string.IsNullOrWhiteSpace(header))
        {
            return header.ToString();
        }

        return request.Cookies.TryGetValue(DeviceCookieName, out var cookie) ? cookie : null;
    }

    private static double? ReadCoordinate(HttpRequest request, string headerName) =>
        request.Headers.TryGetValue(headerName, out var value) &&
        double.TryParse(value.ToString(), NumberStyles.Float, CultureInfo.InvariantCulture, out var parsed)
            ? parsed
            : null;
}
