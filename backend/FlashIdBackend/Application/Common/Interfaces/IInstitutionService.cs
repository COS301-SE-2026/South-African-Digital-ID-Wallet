using Application.Features.Institutions.DTOs;

namespace Application.Common.Interfaces;

public interface IInstitutionService
{
    Task<RegisterInstitutionResponseDto> RegisterInstitutionAsync(
        RegisterInstitutionRequestDto request
    );
}