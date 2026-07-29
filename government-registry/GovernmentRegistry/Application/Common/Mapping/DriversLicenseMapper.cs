using Application.Features.Credentials.Dtos;
using Domain.Entities;
using Domain.Enums;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class DriversLicenseMapper
{
    private string MapLicenseCode(LicenseCode licenseCode) => licenseCode.ToString();
    public partial DriversLicenseResponseDto ToResponse(DriversLicense driversLicense);
}