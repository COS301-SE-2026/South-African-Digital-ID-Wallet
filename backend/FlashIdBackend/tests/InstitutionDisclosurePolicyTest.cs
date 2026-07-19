using Application.Common.Services;
using Domain.Enums;

namespace tests;

public class InstitutionDisclosurePolicyTest
{
    [Theory]
    [InlineData(InstitutionType.HomeAffairs)]
    [InlineData(InstitutionType.LicensingDepartment)]
    [InlineData(InstitutionType.Healthcare)]
    [InlineData(InstitutionType.FinancialInstitution)]
    public void ModeFor_NonLawEnforcementInstitution_ReturnsSuggested(InstitutionType institutionType)
    {
        Assert.Equal(DisclosurePolicyMode.Suggested, InstitutionDisclosurePolicy.ModeFor(institutionType));
    }

    [Fact]
    public void ModeFor_LawEnforcement_ReturnsRequired()
    {
        Assert.Equal(DisclosurePolicyMode.Required, InstitutionDisclosurePolicy.ModeFor(InstitutionType.LawEnforcement));
    }

    [Fact]
    public void SuggestedFieldsFor_IdentityDocument_ReturnsIdentityDocumentMandatoryFields()
    {
        var result = InstitutionDisclosurePolicy.SuggestedFieldsFor(InstitutionType.LawEnforcement, isIdentityDocument: true);
        Assert.Equal(QrFieldDefinitions.IdentityDocumentMandatoryFields, result);
    }

    [Fact]
    public void SuggestedFieldsFor_DriversLicense_ReturnsDriversLicenseMandatoryFields()
    {
        var result = InstitutionDisclosurePolicy.SuggestedFieldsFor(InstitutionType.Healthcare, isIdentityDocument: false);
        Assert.Equal(QrFieldDefinitions.DriversLicenseMandatoryFields, result);
    }
}