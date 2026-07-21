using Application.Features.Verification.Dtos;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface ICitizenVerificationService
{
    Task<VerificationResponseDto> VerififyCitizenActivation(VerificationRequestDto request);

}