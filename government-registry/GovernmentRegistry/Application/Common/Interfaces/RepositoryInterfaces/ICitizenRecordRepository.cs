using Application.Features.Citizens.Dtos;
using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface ICitizenRecordRepository
{

    public Task<CitizenRecord> GetCitizenRecord(string saId);
}