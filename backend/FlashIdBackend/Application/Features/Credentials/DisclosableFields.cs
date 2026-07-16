namespace Application.Features.Credentials;

public record DisclosableField(string Key, string Label, bool Mandatory);

public static class DisclosableFields
{
    public const string IdentityDocumentType = "Identity Document";
    public const string DriversLicenseType = "Driver's License";

    public static readonly IReadOnlyList<DisclosableField> IdentityDocument = new List<DisclosableField>
    {
        new("idNumber", "Identity number", true),
        new("fullSurname", "Full surname", true),
        new("fulLForename", "Full forename", true),
        new("dateOfBirth", "Date of birth", true),
        new("citizenshipStatus", "Citizenship status", true),
        new("photograph", "Photograph", true),
        new("gender", "Gender", false),
        new("countryOfBirth", "Country of birth", false),
        new("signature", "Signature", false),
        new("cardIssueDateAndNumber", "Card issue data and number", false)
    };

    public static readonly IReadOnlyList<DisclosableField> DriversLicense = new List<DisclosableField>
    {
        new("fullName", "Full name", true),
        new("saIdNumber", "SA identity number", true),
        new("photograph", "Photograph", true),
        new("licenseNumber", "License number", true),
        new("licenseCode", "License code", true),
        new("expiryDate", "Expiry date", true),
        new("countryOfIssue", "Country of issue", true),
        new("signature", "Signature", false),
        new("dateOfBirth", "Date of birth", false),
        new("vehicleRestrictions", "Vehicle restrictions", false),
        new("dateOfIssue", "Date of issue", false)
    };

    public static IReadOnlyList<DisclosableField> For(string credentialType) =>
        credentialType == IdentityDocumentType ? IdentityDocument : DriversLicense;
}
