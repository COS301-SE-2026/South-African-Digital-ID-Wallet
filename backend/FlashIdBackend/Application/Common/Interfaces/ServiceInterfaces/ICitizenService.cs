using Application.Features.Citizens.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface ICitizenService
{
    Task<RegisterCitizenResponseDto> RegisterCitizenAsync(RegisterCitizenRequestDto request);
    Task VerifyEmailAsync(VerifyEmailRequestDto request);
    Task ResendOtpAsync(ResendOtpRequestDto request);
}
