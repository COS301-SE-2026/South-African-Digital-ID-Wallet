using Application.Common.Interfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Mapping;
using Application.Features.Citizens.Dtos;

namespace Application.Common.Services;

public class CitizenRecordService : ICitizenRecordService
{
    private readonly ICitizenRecordRepository _repository;

    public CitizenRecordService(ICitizenRecordRepository repository)
    {
        _repository = repository;
    }

    public async Task<CitizenRecordResponseDto> GetCitizenRecord(string saId)
    {
        var citizenRecord = await _repository.GetCitizenRecord(saId);

        if (citizenRecord is null)
            return null;

        var mapper = new CitizenMapper();
        var response = mapper.ToResponse(citizenRecord);
        return response;
    }
}