using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();

        if (await context.CitizenRecords.AnyAsync())
            return;

        var today = DateOnly.FromDateTime(DateTime.Today);

        var citizens = new List<CitizenRecord>
        {
            CreateCitizen("0000000000001", "Amahle", "Dlamini", Gender.Female, new DateOnly(2001,05,17), true, true),
            CreateCitizen("0000001000002", "Bontle", "Mokoena", Gender.Female, new DateOnly(1992,07,10), true, false),
            CreateCitizen("0000002000003", "Chloe", "Naidoo", Gender.Female, new DateOnly(2009,01,11), true, false),
            CreateCitizen("0000003000004", "Dineo", "Nkosi", Gender.Female, new DateOnly(2011,07,21), false, false),
            CreateCitizen("0000004000005", "Elani", "Peters", Gender.Female, new DateOnly(1984,03,02), true, true),
            CreateCitizen("0000000000006", "Fatima", "Khan", Gender.Female, new DateOnly(1997,10,28), true, true),
            CreateCitizen("0000001000007", "Grace", "Maseko", Gender.Female, new DateOnly(2013,08,23), false, false),
            CreateCitizen("0000002000008", "Hannah", "Jacobs", Gender.Female, new DateOnly(1975,09,24), true, false),
            CreateCitizen("0000003000009", "Imani", "Ndlovu", Gender.Female, new DateOnly(2006,09,16), true, true),
            CreateCitizen("0000004000010", "Lerato", "Mahlangu", Gender.Female, new DateOnly(2010,10,29), true, false),

            CreateCitizen("0000005000011", "Nathan", "Khumalo", Gender.Male, new DateOnly(1998,11,15), true, true),
            CreateCitizen("0000006000012", "Oscar", "Botha", Gender.Male, new DateOnly(1993,02,12), true, true),
            CreateCitizen("0000007000013", "Peter", "Mthembu", Gender.Male, new DateOnly(2012,04,06), false, false),
            CreateCitizen("0000008000014", "Quinton", "Molefe", Gender.Male, new DateOnly(2008,01,17), true, false),
            CreateCitizen("0000009000015", "Ryan", "Jacobs", Gender.Male, new DateOnly(1981,03,04), true, true),
            CreateCitizen("0000005000016", "Sipho", "Zuma", Gender.Male, new DateOnly(2004,09,17), true, true),
            CreateCitizen("0000006000017", "Thabo", "Sithole", Gender.Male, new DateOnly(2014,12,06), false, false),
            CreateCitizen("0000007000018", "Unathi", "Tshabalala", Gender.Male, new DateOnly(1989,06,21), true, false),
            CreateCitizen("0000008000019", "Vuyo", "Mabena", Gender.Male, new DateOnly(2007,08,13), true, true),
            CreateCitizen("0000009000020", "Warren", "Daniels", Gender.Male, new DateOnly(2011,02,26), false, false)
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
        bool hasDriversLicense)
    {
        var citizen = new CitizenRecord
        {
            Id = Guid.NewGuid(),
            SaId = saId,
            Names = names,
            Surname = surname,
            Gender = gender,
            DateOfBirth = dateOfBirth
        };

        if (hasIdentityDocument)
        {
            citizen.Credentials.Add(new IdentityDocument
            {
                Id = Guid.NewGuid(),
                CitizenId = citizen.Id,
                Signature = $"mock-signature-id-{saId}",
                IssuedBy = "Department of Home Affairs",
                IssueDate = new DateOnly(2020, 1, 1),
                CountryOfBirth = "ZA",
                CitizenshipStatus = CitizenStatus.Citizen,
                Nationality = "South African",
                PhotoBlob = MockPhotoData.PlaceholderPhotoBase64
            });
        }

        if (hasDriversLicense)
        {
            citizen.Credentials.Add(new DriversLicense
            {
                Id = Guid.NewGuid(),
                CitizenId = citizen.Id,
                Signature = $"mock-signature-dl-{saId}",
                IssuedBy = "Road Traffic Management Corporation",
                IssueDate = new DateOnly(2021, 6, 1),
                LicenseNumber = $"DL-{saId[^6..]}",
                LicenseCode = LicenseCode.B,
                Restrictions = null,
                ExpiryDate = new DateOnly(2029, 6, 1),
                PhotoBlob = MockPhotoData.PlaceholderPhotoBase64
            });
        }

        return citizen;
    }
}