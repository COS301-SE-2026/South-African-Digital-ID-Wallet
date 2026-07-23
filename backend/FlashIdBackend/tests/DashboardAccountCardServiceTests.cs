using Application.Common.Mapping;
using Application.Common.Services;
using Domain.Entities;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace tests;

public class DashboardAccountCardServiceTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static DashboardAccountCardService CreateService(AppDbContext context)
    {
        return new DashboardAccountCardService(
            new DashboardAccountCardRepository(context),
            new DashboardAccountCardMapper()
        );
    }

    [Fact]
    public async Task GetMyAccountAsync_NoCitizen_ReturnsNull()
    {
        using var context = CreateContext();

        var service = CreateService(context);

        var result = await service.GetMyAccountAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact]
    public async Task GetMyAccountAsync_ReturnsMappedAccountCard()
    {
        using var context = CreateContext();

        var userId = Guid.NewGuid();

        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            SaId = "0001015009087",
            Names = "Logan",
            Surname = "Dlamini"
        };

        context.Citizens.Add(citizen);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);

        var result = await service.GetMyAccountAsync(userId);

        Assert.NotNull(result);

        Assert.Equal(userId, result.UserId);
        Assert.Equal("0001015009087", result.SaId);
        Assert.Equal("Logan", result.Names);
        Assert.Equal("Dlamini", result.Surname);
    }
}