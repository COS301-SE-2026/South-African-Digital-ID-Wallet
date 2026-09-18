using System.Text.RegularExpressions;
using Application.Common.Services;
using Application.Features.Credentials.Enums;

namespace tests;

public class SdJwtClaimNamesTests
{
    private static readonly Dictionary<string, string> ExpectedIdentityDocumentClaims = new()
    {
        ["Date of birth"] = "date_of_birth",
        ["Photograph"] = "portrait",
        ["Identity number"] = "identity_number",
        ["Full surname"] = "surname",
        ["Full forenames"] = "forenames",
        ["Citizenship status"] = "citizenship_status",
        ["Gender"] = "gender",
        ["Country of birth"] = "country_of_birth",
        ["Card issue date and number"] = "card_issue_date_and_number",
        ["Signature"] = "signature_image",
    };

    private static readonly Dictionary<string, string> ExpectedDriversLicenseClaims = new()
    {
        ["Photo"] = "portrait",
        ["Expiry date"] = "expiry_date",
        ["Date of birth"] = "date_of_birth",
        ["Full name"] = "full_name",
        ["SA ID number"] = "identity_number",
        ["License number"] = "license_number",
        ["License code"] = "license_code",
        ["Country of issue"] = "country_of_issue",
        ["Vehicle restrictions"] = "vehicle_restrictions",
        ["Date of issue"] = "issue_date",
        ["Signature"] = "signature_image",
    };

    private static IEnumerable<string> AllLabelsFor(CredentialType type) => type == CredentialType.IdentityDocument
        ? QrFieldDefinitions.IdentityDocumentMandatoryFields.Concat(QrFieldDefinitions.IdentityDocumentOptionalFields)
        : QrFieldDefinitions.DriversLicenseMandatoryFields.Concat(QrFieldDefinitions.DriversLicenseOptionalFields);

    [Theory]
    [InlineData(CredentialType.IdentityDocument)]
    [InlineData(CredentialType.DriversLicense)]
    public void LabelToClaimFor_QrFieldDefinitionLabels_MapsExactlyThoseLabels(CredentialType type)
    {
        var labels = AllLabelsFor(type).Order().ToList();

        var mappedLabels = SdJwtClaimNames.LabelToClaimFor(type).Keys.Order().ToList();

        Assert.Equal(labels, mappedLabels);
    }

    [Fact]
    public void LabelToClaimFor_IdentityDocument_MatchesWireFormatSection5()
    {
        var actual = SdJwtClaimNames.LabelToClaimFor(CredentialType.IdentityDocument);

        Assert.Equal(ExpectedIdentityDocumentClaims.OrderBy(p => p.Key), actual.OrderBy(p => p.Key));
    }

    [Fact]
    public void LabelToClaimFor_DriversLicense_MatchesWireFormatSection5()
    {
        var actual = SdJwtClaimNames.LabelToClaimFor(CredentialType.DriversLicense);

        Assert.Equal(ExpectedDriversLicenseClaims.OrderBy(p => p.Key), actual.OrderBy(p => p.Key));
    }

    [Theory]
    [InlineData(CredentialType.IdentityDocument)]
    [InlineData(CredentialType.DriversLicense)]
    public void LabelToClaimFor_AnyCredentialType_ClaimNamesAreUniqueSnakeCase(CredentialType type)
    {
        var claimNames = SdJwtClaimNames.LabelToClaimFor(type).Values.ToList();

        Assert.Equal(claimNames.Count, claimNames.Distinct().Count());
        Assert.All(claimNames, name => Assert.Matches(new Regex("^[a-z]+(_[a-z]+)*$"), name));
    }

    [Fact]
    public void MandatoryClaimsFor_IdentityDocument_ReturnsDateOfBirthAndPortrait()
    {
        var actual = SdJwtClaimNames.MandatoryClaimsFor(CredentialType.IdentityDocument);

        Assert.Equal(new[] { "date_of_birth", "portrait" }, actual.Order());
    }

    [Fact]
    public void MandatoryClaimsFor_DriversLicense_ReturnsPortraitExpiryAndDateOfBirth()
    {
        var actual = SdJwtClaimNames.MandatoryClaimsFor(CredentialType.DriversLicense);

        Assert.Equal(new[] { "date_of_birth", "expiry_date", "portrait" }, actual.Order());
    }

    [Theory]
    [InlineData(CredentialType.IdentityDocument, "urn:flashid:identity-document:1")]
    [InlineData(CredentialType.DriversLicense, "urn:flashid:drivers-license:1")]
    public void VctFor_KnownType_ReturnsWireFormatVct(CredentialType type, string expected)
    {
        Assert.Equal(expected, SdJwtClaimNames.VctFor(type));
    }

    [Fact]
    public void ClaimNameFor_UnknownLabel_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => SdJwtClaimNames.ClaimNameFor(CredentialType.IdentityDocument, "Blood type"));
    }

    [Fact]
    public void ClaimNameFor_DriversLicenseLabelOnIdentityDocument_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => SdJwtClaimNames.ClaimNameFor(CredentialType.IdentityDocument, "SA ID number"));
    }

    [Fact]
    public void ClaimNameFor_LabelWithDifferentCase_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => SdJwtClaimNames.ClaimNameFor(CredentialType.DriversLicense, "photo"));
    }

    [Theory]
    [InlineData("signature_image", false)]
    [InlineData("portrait", true)]
    [InlineData("date_of_birth", true)]
    public void IsIncludedOffline_ClaimName_ReturnsExpected(string claimName, bool expected)
    {
        Assert.Equal(expected, SdJwtClaimNames.IsIncludedOffline(claimName));
    }

    [Fact]
    public void VctFor_UndefinedType_ThrowsArgumentOutOfRangeException()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => SdJwtClaimNames.VctFor((CredentialType)99));
    }

    [Fact]
    public void LabelToClaimFor_UndefinedType_ThrowsArgumentOutOfRangeException()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => SdJwtClaimNames.LabelToClaimFor((CredentialType)99));
    }

    [Fact]
    public void MandatoryClaimsFor_UndefinedType_ThrowsArgumentOutOfRangeException()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => SdJwtClaimNames.MandatoryClaimsFor((CredentialType)99));
    }
}
