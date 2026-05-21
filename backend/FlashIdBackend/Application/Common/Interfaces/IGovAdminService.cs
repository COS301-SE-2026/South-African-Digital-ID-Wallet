using Application.Features.GovernmentAdministrators.DTOs;

namespace Application.Common.Interfaces;

public interface IGovAdminService
{
    Task<RegisterGovAdminResponseDto> RegisterGovAdminAsync(RegisterGovAdminRequestDto request);
}
