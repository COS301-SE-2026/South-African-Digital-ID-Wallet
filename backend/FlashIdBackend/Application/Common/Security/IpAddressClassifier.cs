using System.Net;
using System.Net.Sockets;

namespace Application.Common.Security;

public static class IpAddressClassifier
{
    public static bool IsPublic(string? ipAddress)
    {
        if (string.IsNullOrWhiteSpace(ipAddress) || !IPAddress.TryParse(ipAddress, out var address))
        {
            return false;
        }

        if (address.IsIPv4MappedToIPv6)
        {
            address = address.MapToIPv4();
        }

        if (IPAddress.IsLoopback(address))
        {
            return false;
        }

        if (address.AddressFamily == AddressFamily.InterNetwork)
        {
            var b = address.GetAddressBytes();
            var isPrivate =
                b[0] == 0 ||
                b[0] == 10 ||
                (b[0] == 100 && b[1] >= 64 && b[1] <= 127) ||
                (b[0] == 169 && b[1] == 254) ||
                (b[0] == 172 && b[1] >= 16 && b[1] <= 31) ||
                (b[0] == 192 && b[1] == 168) ||
                b[0] >= 224;
            return !isPrivate;
        }

        if (address.AddressFamily == AddressFamily.InterNetworkV6)
        {
            return !(address.IsIPv6LinkLocal ||
                     address.IsIPv6SiteLocal ||
                     address.IsIPv6UniqueLocal ||
                     address.IsIPv6Multicast ||
                     address.Equals(IPAddress.IPv6Any) ||
                     address.Equals(IPAddress.IPv6None));
        }

        return false;
    }
}
