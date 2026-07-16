namespace Application.Common.Services;

public static class QrFieldDefinitions
{
    public static readonly IReadOnlyList<string> IdentityDocumentMandatoryFields = new List<string>
    {
        "Identity number", "Full surname", "Full forenames",
        "Date of birth", "Citizenship status", "Photograph",
    };

    public static readonly IReadOnlyList<string> IdentityDocumentOptionalFields = new List<string>
    {
        "Gender", "Country of birth", "Signature", "Card issue date and number",
    };

    public static readonly IReadOnlyList<string> DriversLicenseMandatoryFields = new List<string>
    {
        "Full name", "SA ID number", "Photo", "License number",
        "License code", "Expiry date", "Country of issue",
    };

    public static readonly IReadOnlyList<string> DriversLicenseOptionalFields = new List<string>
    {
        "Signature", "Date of birth", "Vehicle restrictions", "Date of issue",
    };
}