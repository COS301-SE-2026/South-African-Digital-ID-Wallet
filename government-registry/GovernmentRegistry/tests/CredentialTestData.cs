using Domain.Entities;
using Domain.Enums;

namespace tests;

internal static class CredentialTestData
{
    public static CitizenRecord ValidCitizenRecord(string saId = "9001015800083") => new()
    {
        Id = Guid.NewGuid(),
        SaId = saId,
        Names = "Thandiwe",
        Surname = "Mokoena",
        Gender = Gender.Female,
        DateOfBirth = new DateOnly(1990, 1, 1),
    };

    public static IdentityDocument ValidIdentityDocument(CitizenRecord citizen) => new()
    {
        Id = Guid.NewGuid(),
        Signature = "sig",
        IssuedBy = "Home Affairs",
        IssueDate = new DateOnly(2021, 3, 15),
        CitizenId = citizen.Id,
        Citizen = citizen,
        CountryOfBirth = "South Africa",
        CitizenshipStatus = CitizenStatus.Citizen,
        Nationality = "South African",
        PhotoBlob = "photo.jpg",
    };

    public static DriversLicense ValidDriversLicense(CitizenRecord citizen) => new()
    {
        Id = Guid.NewGuid(),
        Signature = "sig",
        IssuedBy = "Licensing Department",
        IssueDate = new DateOnly(2021, 3, 15),
        CitizenId = citizen.Id,
        Citizen = citizen,
        LicenseNumber = "4589161234567",
        LicenseCode = LicenseCode.C,
        Restrictions = "01",
        ExpiryDate = new DateOnly(2030, 1, 1),
        PhotoBlob = "license.jpg",
    };
}