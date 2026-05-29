using Application.Features.Onboarding.DTOs;

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

        },
        new()
        {
            SaId = "0000001960615",
            Names = "Naveen",
            Surname = "Rogers",
            DateOfBirth = new DateTime(1996, 6, 15),
            Gender = "Male",
            Nationality = "South African",

        },
        new()
        {
            SaId = "0000002010302",
            Names = "Po",
            Surname = "Ping",
            DateOfBirth = new DateTime(2001, 3, 2),
            Gender = "Male",
            Nationality = "South African",

        },
        new()
        {
            SaId = "0000002740723",
            Names = "Master",
            Surname = "Shifu",
            DateOfBirth = new DateTime(1974, 07, 23),
            Gender = "Male",
            Nationality = "South African",

        },
        new()
        {
            SaId = "0000007590723",
            Names = "Master",
            Surname = "Oogway",
            DateOfBirth = new DateTime(1959, 07, 23),
            Gender = "Male",
            Nationality = "South African",

        },
        new()
        {
            SaId = "0000007010603",
            Names = "Tigress",
            Surname = "Feline",
            DateOfBirth = new DateTime(2001, 06, 03),
            Gender = "Male",
            Nationality = "South African",

        }

    ];

    public MockIdentityRecordDto? GetBySaId(string idNumber)
    {
        return MockRecords.FirstOrDefault(record => record.SaId == idNumber);
    }
}