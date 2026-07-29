namespace Application.Common.Services;

public static class QrFieldDefinitions
{
    public static readonly IReadOnlyList<string> IdentityDocumentMandatoryFields = new List<string>
    {
        "Date of birth", "Photograph",
    };

    public static readonly IReadOnlyList<string> IdentityDocumentOptionalFields = new List<string>
    {
        "Identity number", "Full surname", "Full forenames","Citizenship status","Gender", "Country of birth", "Signature", "Card issue date and number",
    };

    public static readonly IReadOnlyList<string> DriversLicenseMandatoryFields = new List<string>
    {
        "Photo", "Expiry date", "Date of birth",
    };

    public static readonly IReadOnlyList<string> DriversLicenseOptionalFields = new List<string>
    {
        "Full name", "SA ID number", "License number", "License code","Country of issue", "Signature", "Vehicle restrictions", "Date of issue",
    };
}