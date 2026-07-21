using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Verification.Dtos;

namespace Application.Common.Services;

public class CitizenVerificationService : ICitizenVerificationService
{
    private readonly ICitizenVerificationService _citizenVerificationService;
    private readonly IVerificationRepository _verificationRepository;

    public CitizenVerificationService(IVerificationRepository verificationRepository, ICitizenVerificationService citizenVerificationService)
    {
        _verificationRepository = verificationRepository;
        _citizenVerificationService = citizenVerificationService;

    }


    public Task<VerificationResponseDto> VerififyCitizenActivation(VerificationRequestDto request)
    {
        return null;
    }
}