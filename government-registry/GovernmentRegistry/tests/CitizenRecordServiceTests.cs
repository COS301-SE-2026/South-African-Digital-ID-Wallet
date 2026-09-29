using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Services;
using Domain.Entities;
using Domain.Enums;

namespace tests;

public class CitizenRecordServiceTests
{
    private sealed class FakeCitizenRecordRepository : ICitizenRecordRepository
    {
        public CitizenRecord? RecordToReturn { get; set; }

        public Task<CitizenRecord> GetCitizenRecord(string saId) =>
            Task.FromResult(RecordToReturn!);
    }

    private static CitizenRecord ValidCitizenRecord() => new()
    {
        Id = Guid.NewGuid(),
        SaId = "9001015800083",
        Names = "Thandiwe",
        Surname = "Mokoena",
        Gender = Gender.Female,
        DateOfBirth = new DateOnly(1990, 1, 1),
    };

    [Fact]
    public async Task GetCitizenRecord_RecordExists_ReturnsMappedResponse()
    {
        var record = ValidCitizenRecord();
        var repository = new FakeCitizenRecordRepository { RecordToReturn = record };
        var service = new CitizenRecordService(repository);

        var result = await service.GetCitizenRecord(record.SaId);

        Assert.NotNull(result);
        Assert.Equal(record.Names, result.Names);
        Assert.Equal(record.Surname, result.Surname);
    }

    [Fact]
    public async Task GetCitizenRecord_RecordNotFound_ReturnsNull()
    {
        var repository = new FakeCitizenRecordRepository { RecordToReturn = null };
        var service = new CitizenRecordService(repository);

        var result = await service.GetCitizenRecord("0000000000000");

        Assert.Null(result);
    }
}