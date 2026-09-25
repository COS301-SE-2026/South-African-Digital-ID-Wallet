namespace Application.Features.Credentials.DTOs;

// Body of the offline package request. Without a device key the package is minted unbound, which Emergency QR relies on.
public sealed record OfflinePackageRequestDto(DevicePublicKeyDto? DeviceKey);
