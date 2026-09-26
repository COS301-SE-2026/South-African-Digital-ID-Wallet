namespace Application.Features.Credentials.DTOs;

// Every wallet package is bound to the phone that asked for it. An unbound package would let anyone holding
// the citizen's session mint a credential that verifies without key binding, and would downgrade a bound one.
public sealed record OfflinePackageRequestDto(DevicePublicKeyDto DeviceKey);
