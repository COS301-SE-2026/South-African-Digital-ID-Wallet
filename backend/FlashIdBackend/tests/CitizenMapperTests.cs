using Application.Common.Mapping;
using Domain.Entities;
using Domain.Enums;

namespace tests;

public class CitizenMapperTests
{
    private static User ExampleUser() => new()
    {
        Id = Guid.NewGuid(),
        Email = "random@citizen.com",
        PasswordHash = "randomHash",
        Role = UserRole.Citizen,
        CreatedAt = new DateTime(2026, 1, 1, 13, 30, 0, DateTimeKind.Utc),
        UpdatedAt = new DateTime(2026, 1, 1, 13, 30, 0, DateTimeKind.Utc)
    };

    [Fact]
    public void CitizenToRegisterResponseDto_MapsUserId()
    {
        var mapper = new CitizenMapper();
        var user = ExampleUser();
        var res = mapper.CitizenToRegisterResponseDto(user);
        Assert.Equal(user.Id, res.UserId);
    }

    [Fact]
    public void CitizenToRegisterResponseDto_MapsEmail()
    {
        var mapper = new CitizenMapper();
        var user = ExampleUser();
        var res = mapper.CitizenToRegisterResponseDto(user);
        Assert.Equal(user.Email, res.Email);
    }

    [Fact]
    public void CitizenToRegisterResponseDto_MapsCreatedAt()
    {
        var mapper = new CitizenMapper();
        var user = ExampleUser();
        var res = mapper.CitizenToRegisterResponseDto(user);
        Assert.Equal(user.CreatedAt, res.CreatedAt);
    }

    [Fact]
    public void CitizenToRegisterResponseDto_MessageNotMapped()
    {
        var mapper = new CitizenMapper();
        var user = ExampleUser();
        var res = mapper.CitizenToRegisterResponseDto(user);
        Assert.Empty(res.Message);
    }
}