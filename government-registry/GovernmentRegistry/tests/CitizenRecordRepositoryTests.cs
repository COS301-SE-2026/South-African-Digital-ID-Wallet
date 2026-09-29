using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace tests;

public class CitizenRecordRepositoryTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static CitizenRecord ValidCitizenRecord(string saId) => new()
    {
        Id = Guid.NewGuid(),
        SaId = saId,
        Names = "Thandiwe",
        Surname = "Mokoena",
        Gender = Gender.Female,
        DateOfBirth = new DateOnly(1990, 1, 1),
    };

    [Fact]
    public async Task GetCitizenRecord_RecordExists_ReturnsRecord()
    {
        using var context = CreateContext();
        var record = ValidCitizenRecord("9001015800083");
        await context.CitizenRecords.AddAsync(record, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var repository = new CitizenRecordRepository(context);
        var result = await repository.GetCitizenRecord("9001015800083");

        Assert.NotNull(result);
        Assert.Equal(record.Id, result.Id);
        Assert.Equal(record.Names, result.Names);
    }

    [Fact]
    public async Task GetCitizenRecord_RecordNotFound_ReturnsNull()
    {
        using var context = CreateContext();
        var repository = new CitizenRecordRepository(context);

        var result = await repository.GetCitizenRecord("0000000000000");

        Assert.Null(result);
    }
}