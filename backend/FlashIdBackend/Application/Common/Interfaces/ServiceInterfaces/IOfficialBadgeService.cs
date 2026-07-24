using Application.Features.Officials.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IOfficialBadgeService
{
    Task<GenerateBadgeTokenResponseDto> GenerateBadgeTokenAsync(Guid userId);
    Task<VerifyBadgeResponseDto> VerifyBadgeAsync(string token);
}