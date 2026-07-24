using Application.Features.Verification.Dtos;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface ICitizenVerificationService
{
    Task<VerificationResponseDto> VerifyCitizenActivation(VerificationRequestDto request, Guid userId, string ipAddress, CancellationToken cancellationToken);

}