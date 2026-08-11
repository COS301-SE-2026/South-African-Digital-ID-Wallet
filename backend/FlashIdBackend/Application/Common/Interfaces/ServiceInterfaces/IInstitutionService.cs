using Application.Features.Institutions.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IInstitutionService
{
    Task<RegisterInstitutionResponseDto> RegisterInstitutionAsync(
        RegisterInstitutionRequestDto request
    );

    Task<IEnumerable<GetInstitutionResponseDto>> GetAllInstitutionsAsync();

    Task<GetInstitutionResponseDto> GetInstitutionByIdAsync(Guid institutionId);

    Task<RegenerateApiKeyResponseDto> RegenerateApiKeyAsync(Guid institutionId, Guid? adminId);

}