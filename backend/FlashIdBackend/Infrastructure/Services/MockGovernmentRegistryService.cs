using Application.Features.Onboarding.Dtos;

namespace Infrastructure.Services;

public class MockGovernmentRegistryService
{
    private static readonly List<MockIdentityRecordDto> MockRecords =
    [
        new()
        {
            SaId = "0000001971025",
            Names = "Tiana",
            Surname = "Rogers",
            DateOfBirth = new DateTime(1997, 10, 25),
            Gender = "Female",
            Nationality = "South African",
            Status = "Active"
        },
        new()
        {
            SaId = "0000001960615",
            Names = "Naveen",
            Surname = "Rogers",
            DateOfBirth = new DateTime(1996, 6, 15),
            Gender = "Male",
            Nationality = "South African",
            Status = "Active"
        },
        new()
        {
            SaId = "0000002010302",
            Names = "Po",
            Surname = "Ping",
            DateOfBirth = new DateTime(2001, 3, 2),
            Gender = "Male",
            Nationality = "South African",
            Status = "Inactive"
        },
        new()
        {
            SaId = "0000002740723",
            Names = "Po",
            Surname = "Ping",
            DateOfBirth = new DateTime(1974, 07, 23),
            Gender = "Male",
            Nationality = "South African",
            Status = "Active"
        }
    ];

    public MockIdentityRecordDto? GetBySaId(string idNumber)
    {
        return MockRecords.FirstOrDefault(record => record.SaId == idNumber);
    }
}