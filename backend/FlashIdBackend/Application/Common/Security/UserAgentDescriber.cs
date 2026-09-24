namespace Application.Common.Security;

public static class UserAgentDescriber
{
    public const string UnknownDevice = "Unknown device";

    public static string Describe(string? userAgent)
    {
        if (string.IsNullOrWhiteSpace(userAgent))
        {
            return UnknownDevice;
        }

        var browser = DetectBrowser(userAgent);
        var operatingSystem = DetectOperatingSystem(userAgent);

        if (browser is null && operatingSystem is null)
        {
            return UnknownDevice;
        }

        return $"{browser ?? "Unknown browser"} on {operatingSystem ?? "unknown OS"}";
    }

    private static string? DetectBrowser(string ua)
    {
        if (Contains(ua, "okhttp") || Contains(ua, "CFNetwork") || Contains(ua, "Expo") || Contains(ua, "FlashID")) return "FlashID app";
        if (Contains(ua, "Edg/")) return "Edge";
        if (Contains(ua, "OPR/")) return "Opera";
        if (Contains(ua, "Firefox/")) return "Firefox";
        if (Contains(ua, "Chrome/") || Contains(ua, "CriOS/")) return "Chrome";
        if (Contains(ua, "Safari/")) return "Safari";
        return null;
    }

    private static string? DetectOperatingSystem(string ua)
    {
        if (Contains(ua, "iPhone") || Contains(ua, "iPad") || Contains(ua, "iOS") || Contains(ua, "CFNetwork")) return "iOS";
        if (Contains(ua, "Android") || Contains(ua, "okhttp")) return "Android";
        if (Contains(ua, "Windows")) return "Windows";
        if (Contains(ua, "Mac OS X") || Contains(ua, "Macintosh")) return "macOS";
        if (Contains(ua, "Linux")) return "Linux";
        return null;
    }

    private static bool Contains(string value, string token) =>
        value.Contains(token, StringComparison.OrdinalIgnoreCase);
}
