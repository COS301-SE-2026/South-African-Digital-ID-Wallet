using Application.Features.Citizens.Dtos;

namespace Application.Common.Interfaces;

public interface ICitizenRecordService
{
    Task<CitizenRecordResponseDto> GetCitizenRecord(string saId);
}