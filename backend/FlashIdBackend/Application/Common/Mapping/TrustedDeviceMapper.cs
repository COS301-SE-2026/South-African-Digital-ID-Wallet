using Application.Features.TrustedDevices.DTOs;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class TrustedDeviceMapper
{
    [MapperIgnoreTarget(nameof(TrustedDeviceDto.DeviceName))]
    [MapperIgnoreTarget(nameof(TrustedDeviceDto.IsCurrentDevice))]
    public partial TrustedDeviceDto TrustedDeviceToDto(TrustedDevice trustedDevice);

    public partial List<TrustedDeviceDto> TrustedDevicesToDtos(
        List<TrustedDevice> trustedDevices
    );
}