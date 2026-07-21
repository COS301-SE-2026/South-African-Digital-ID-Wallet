using Application.Features.DashboardAccountCard.DTOs;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class DashboardAccountCardMapper
{
    public partial DashboardAccountCardDto CitizenToResponseDto(Citizen citizen);
}