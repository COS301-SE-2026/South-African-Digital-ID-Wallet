using Application.Common.Interfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
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

        return new CitizenRecordResponseDto
        {
            SaId = citizenRecord.SaId,
            Names = citizenRecord.Names,
            Surname = citizenRecord.Surname,
            Gender = citizenRecord.Gender.ToString(),
            DateOfBirth = citizenRecord.DateOfBirth,
        };
    }
}