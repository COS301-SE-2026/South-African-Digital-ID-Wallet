using Application.Common.Services;
using Domain.Entities;
using Domain.Enums;

namespace tests;

public class DisclosedFieldValueResolverTests
{
    private static Credential IdentityDocumentCredential()
    {
        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            SaId = "9001015800083",
            Names = "Thandiwe",
            Surname = "Mokoena",
            DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Gender = Gender.Female,
        };

        var cred = new Credential
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Citizen = citizen,
            IssueDate = new DateTime(2021, 3, 15, 0, 0, 0, DateTimeKind.Utc),
        };

        cred.IdentityDocument = new IdentityDocument
        {
            Id = Guid.NewGuid(),
            CredentialId = cred.Id,
            Credential = cred,
            Citizenship = "Citizen",
            CountryOfBirth = "South Africa",
            Nationality = "South African",
            PhotoPath = "id-photo.jpg",
        };

        return cred;
    }

    private static Credential DriversLicenseCredential()
    {
        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            SaId = "9001015800083",
            Names = "Thandiwe",
            Surname = "Mokoena",
            DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        };

        var cred = new Credential
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Citizen = citizen,
            IssueDate = new DateTime(2021, 3, 15, 0, 0, 0, DateTimeKind.Utc),
        };

        cred.DriversLicense = new DriversLicense
        {
            Id = Guid.NewGuid(),
            CredentialId = cred.Id,
            Credential = cred,
            LicenseNumber = "4589161234567",
            LicenseCode = LicenseCode.C,
            Restrictions = "01",
            ExpiryDate = new DateTime(2030, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            PhotoPath = "license-photo.jpg",
            CountryOfIssue = "South Africa",
        };

        return cred;
    }

    [Theory]
    [InlineData("Identity number", "9001015800083")]
    [InlineData("Full surname", "Mokoena")]
    [InlineData("Full forenames", "Thandiwe")]
    [InlineData("Date of birth", "1990-01-01")]
    [InlineData("Citizenship status", "Citizen")]
    [InlineData("Photograph", "id-photo.jpg")]
    [InlineData("Country of birth", "South Africa")]
    public void Resolve_IdentityDocumentFields_ReturnsExpectedValue(string field, string expected)
    {
        var cred = IdentityDocumentCredential();
        var res = DisclosedFieldValueResolver.Resolve(cred, new[] { field });
        Assert.Equal(expected, res[field]);
    }

    [Fact]
    public void Resolve_Gender_ReturnsCitizenGender()
    {
        var cred = IdentityDocumentCredential();
        var res = DisclosedFieldValueResolver.Resolve(cred, new[] { "Gender" });
        Assert.Equal("Female", res["Gender"]);
    }

    [Theory]
    [InlineData("SA ID number", "9001015800083")]
    [InlineData("Full name", "Thandiwe Mokoena")]
    [InlineData("License number", "4589161234567")]
    [InlineData("License code", "C")]
    [InlineData("Expiry date", "2030-01-01")]
    [InlineData("Photo", "license-photo.jpg")]
    [InlineData("Country of issue", "South Africa")]
    [InlineData("Vehicle restrictions", "01")]
    public void Resolve_DriversLicenseFields_ReturnsExpectedValue(string field, string expected)
    {
        var cred = DriversLicenseCredential();
        var res = DisclosedFieldValueResolver.Resolve(cred, new[] { field });
        Assert.Equal(expected, res[field]);
    }

    [Fact]
    public void Resolve_MultiplFields_ReturnsAllRequestedValues()
    {
        var cred = IdentityDocumentCredential();
        var res = DisclosedFieldValueResolver.Resolve(cred, new[] { "Identity number", "Full surname", "Gender" });
        Assert.Equal("Female", res["Gender"]);
        Assert.Equal("Mokoena", res["Full surname"]);
        Assert.Equal("9001015800083", res["Identity number"]);
        Assert.Equal(3, res.Count);
    }

    [Fact]
    public void Resolve_UnknownField_ThrowsInvalidOperationException()
    {
        var cred = IdentityDocumentCredential();
        Assert.Throws<InvalidOperationException>(() => DisclosedFieldValueResolver.Resolve(cred, new[] { "This is not a real field" }));
    }
}