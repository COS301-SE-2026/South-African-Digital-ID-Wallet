using Application.Features.Verification.Dtos;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public static partial class PhysicalIdentityVerificationMapper
{
    [MapProperty(
        nameof(PhysicalIdentityVerification.Id),
        nameof(PhysicalVerificationResponseDto.VerificationId))]
    public static partial PhysicalVerificationResponseDto
        ToPhysicalVerificationResponseDto(PhysicalIdentityVerification verification);
}