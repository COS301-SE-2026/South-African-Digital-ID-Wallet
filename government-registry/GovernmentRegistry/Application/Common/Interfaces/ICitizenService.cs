using Application.Features.Citizens.Dtos;

namespace Application.Common.Interfaces;

public interface ICitizenService
{
    Task<CitizenRecordResponseDto> GetCitizenRecord(string saId);
}