using Domain.Enums;

namespace Application.Common.Services;

public static class InstitutionDisclosurePolicy
{
    public static DisclosurePolicyMode ModeFor(InstitutionType institutionType) =>
        institutionType == InstitutionType.LawEnforcement
            ? DisclosurePolicyMode.Required
            : DisclosurePolicyMode.Suggested;

    public static IReadOnlyList<string> SuggestedFieldsFor(InstitutionType institutionType, bool isIdentityDocument) =>
        isIdentityDocument
            ? QrFieldDefinitions.IdentityDocumentMandatoryFields
            : QrFieldDefinitions.DriversLicenseMandatoryFields;
}