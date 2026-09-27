using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public static class DbSeeder
{
    private static readonly Random PhotoRandom = new(42);
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();

        if (await context.CitizenRecords.AnyAsync())
            return;

        var today = DateOnly.FromDateTime(DateTime.Today);

        var citizens = new List<CitizenRecord>
        {
            CreateCitizen("0105170001082", "Amahle", "Dlamini", Gender.Female, new DateOnly(2001,05,17), true, true, MockPhotoData.Unathi),
            CreateCitizen("9207100002080", "Bontle", "Mokoena", Gender.Female, new DateOnly(1992,07,10), true, false, MockPhotoData.Unathi),
            CreateCitizen("0901110003083", "Chloe", "Naidoo", Gender.Female, new DateOnly(2009,01,11), true, false, MockPhotoData.Unathi),
            CreateCitizen("1107210004083", "Dineo", "Nkosi", Gender.Female, new DateOnly(2011,07,21), false, false, MockPhotoData.Unathi),
            CreateCitizen("8403020005086", "Elani", "Peters", Gender.Female, new DateOnly(1984,03,02), true, true, MockPhotoData.Unathi),
            CreateCitizen("9710280006086", "Fatima", "Khan", Gender.Female, new DateOnly(1997,10,28), true, true, MockPhotoData.Unathi),
            CreateCitizen("1308230007086", "Grace", "Maseko", Gender.Female, new DateOnly(2013,08,23), false, false, MockPhotoData.Unathi),
            CreateCitizen("7509240008089", "Hannah", "Jacobs", Gender.Female, new DateOnly(1975,09,24), true, false, MockPhotoData.Unathi),
            CreateCitizen("0609160009088", "Imani", "Ndlovu", Gender.Female, new DateOnly(2006,09,16), true, true, MockPhotoData.Unathi),
            CreateCitizen("1010290010089", "Lerato", "Mahlangu", Gender.Female, new DateOnly(2010,10,29), true, false, MockPhotoData.Unathi),

            CreateCitizen("9811155011084", "Nathan", "Khumalo", Gender.Male, new DateOnly(1998,11,15), true, true, MockPhotoData.Unathi),
            CreateCitizen("9302125012089", "Oscar", "Botha", Gender.Male, new DateOnly(1993,02,12), true, true, MockPhotoData.Unathi),
            CreateCitizen("1204065013085", "Peter", "Mthembu", Gender.Male, new DateOnly(2012,04,06), false, false, MockPhotoData.Unathi),
            CreateCitizen("0801175014084", "Quinton", "Molefe", Gender.Male, new DateOnly(2008,01,17), true, false, MockPhotoData.Unathi),
            CreateCitizen("8103045015082", "Ryan", "Jacobs", Gender.Male, new DateOnly(1981,03,04), true, true, MockPhotoData.Unathi),
            CreateCitizen("0409175016081", "Sipho", "Zuma", Gender.Male, new DateOnly(2004,09,17), true, true, MockPhotoData.Unathi),
            CreateCitizen("1412065017085", "Thabo", "Sithole", Gender.Male, new DateOnly(2014,12,06), false, false, MockPhotoData.Unathi),
            CreateCitizen("8906215018086", "Unathi", "Tshabalala", Gender.Male, new DateOnly(1989,06,21), true, false, MockPhotoData.Unathi),
            CreateCitizen("0708135019089", "Vuyo", "Mabena", Gender.Male, new DateOnly(2007,08,13), true, true, MockPhotoData.Unathi),
            CreateCitizen("1102265020084", "Warren", "Daniels", Gender.Male, new DateOnly(2011,02,26), false, false, MockPhotoData.Unathi)
        };

        context.CitizenRecords.AddRange(citizens);
        await context.SaveChangesAsync();
    }

    private static CitizenRecord CreateCitizen(
        string saId,
        string names,
        string surname,
        Gender gender,
        DateOnly dateOfBirth,
        bool hasIdentityDocument,
        bool hasDriversLicense,
        string? photoBlobName = null)
    {
        var citizen = new CitizenRecord
        {
            Id = Guid.NewGuid(),
            SaId = saId,
            Names = names,
            Surname = surname,
            Gender = gender,
            DateOfBirth = dateOfBirth,
            PhotoBlobName = photoBlobName
        };

        if (hasIdentityDocument)
        {
            citizen.Credentials.Add(new IdentityDocument
            {
                Id = Guid.NewGuid(),
                CitizenId = citizen.Id,
                Signature = "mock-photos-signature.png",
                IssuedBy = "Department of Home Affairs",
                IssueDate = new DateOnly(2020, 1, 1),
                CountryOfBirth = "ZA",
                CitizenshipStatus = CitizenStatus.Citizen,
                Nationality = "South African",
                PhotoBlob = MockPhotoData.PhotoBlobNames[PhotoRandom.Next(MockPhotoData.PhotoBlobNames.Length)]
            });
        }

        if (hasDriversLicense)
        {
            citizen.Credentials.Add(new DriversLicense
            {
                Id = Guid.NewGuid(),
                CitizenId = citizen.Id,
                Signature = "mock-photos-signature.png",
                IssuedBy = "Road Traffic Management Corporation",
                IssueDate = new DateOnly(2021, 6, 1),
                LicenseNumber = $"DL-{saId[^6..]}",
                LicenseCode = LicenseCode.B,
                Restrictions = null,
                ExpiryDate = new DateOnly(2029, 6, 1),
                PhotoBlob = MockPhotoData.PhotoBlobNames[PhotoRandom.Next(MockPhotoData.PhotoBlobNames.Length)]
            });
        }

        return citizen;
    }
}