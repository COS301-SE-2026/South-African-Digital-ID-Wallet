using Application.Features.Citizens.DTOs;

namespace Application.Common.Interfaces;

public interface ICitizenService
{
    Task<RegisterCitizenResponseDto> RegisterCitizenAsync(RegisterCitizenRequestDto request);
}
