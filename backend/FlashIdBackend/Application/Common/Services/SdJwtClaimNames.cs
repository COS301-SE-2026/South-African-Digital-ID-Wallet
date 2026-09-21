using System.Collections.Frozen;
using Application.Features.Credentials.Enums;

namespace Application.Common.Services;

public static class SdJwtClaimNames
{
    public const string IdentityDocumentVct = "urn:flashid:identity-document:1";
    public const string DriversLicenseVct = "urn:flashid:drivers-license:1";
    // Claim names are frozen. Renaming one breaks packages already on citizens' phones.
    public const string Portrait = "portrait";
    public const string DateOfBirth = "date_of_birth";
    public const string IdentityNumber = "identity_number";
    public const string Surname = "surname";
    public const string Forenames = "forenames";
    public const string CitizenshipStatus = "citizenship_status";
    public const string Gender = "gender";
    public const string CountryOfBirth = "country_of_birth";
    public const string CardIssueDateAndNumber = "card_issue_date_and_number";
    public const string FullName = "full_name";
    public const string ExpiryDate = "expiry_date";
    public const string LicenseNumber = "license_number";
    public const string LicenseCode = "license_code";
    public const string CountryOfIssue = "country_of_issue";
    public const string VehicleRestrictions = "vehicle_restrictions";
    public const string IssueDate = "issue_date";
    public const string SignatureImage = "signature_image";

    // Frozen so no caller can cast back to Dictionary and change the shared mapping at runtime.
    private static readonly FrozenDictionary<string, string> IdentityDocumentClaims = new Dictionary<string, string>
    {
        ["Date of birth"] = DateOfBirth,
        ["Photograph"] = Portrait,
        ["Identity number"] = IdentityNumber,
        ["Full surname"] = Surname,
        ["Full forenames"] = Forenames,
        ["Citizenship status"] = CitizenshipStatus,
        ["Gender"] = Gender,
        ["Country of birth"] = CountryOfBirth,
        ["Card issue date and number"] = CardIssueDateAndNumber,
        ["Signature"] = SignatureImage,
    }.ToFrozenDictionary();

    private static readonly FrozenDictionary<string, string> DriversLicenseClaims = new Dictionary<string, string>
    {
        ["Photo"] = Portrait,
        ["Expiry date"] = ExpiryDate,
        ["Date of birth"] = DateOfBirth,
        ["Full name"] = FullName,
        ["SA ID number"] = IdentityNumber,
        ["License number"] = LicenseNumber,
        ["License code"] = LicenseCode,
        ["Country of issue"] = CountryOfIssue,
        ["Vehicle restrictions"] = VehicleRestrictions,
        ["Date of issue"] = IssueDate,
        ["Signature"] = SignatureImage,
    }.ToFrozenDictionary();

    // Signature image is left out of offline packages as it would roughly double the QR frames.
    private static readonly FrozenSet<string> ExcludedFromOffline = new[]
    {
        SignatureImage
    }.ToFrozenSet();

    public static string VctFor(CredentialType type) => type switch
    {
        CredentialType.IdentityDocument => IdentityDocumentVct,
        CredentialType.DriversLicense => DriversLicenseVct,
        _ => throw new ArgumentOutOfRangeException(nameof(type), type, "Unknown credential type."),
    };

    // Reads the mandatory labels from QrFieldDefinitions so that file stays the single source of truth.
    public static IReadOnlyDictionary<string, string> LabelToClaimFor(CredentialType type) => type switch
    {
        CredentialType.IdentityDocument => IdentityDocumentClaims,
        CredentialType.DriversLicense => DriversLicenseClaims,
        _ => throw new ArgumentOutOfRangeException(nameof(type), type, "Unknown credential type."),
    };

    public static string ClaimNameFor(CredentialType type, string label) => LabelToClaimFor(type).TryGetValue(label, out var claimName) ? claimName : throw new ArgumentException($"No claim name is defined for field '{label}' on {type}.", nameof(label));

    public static IReadOnlyList<string> MandatoryClaimsFor(CredentialType type)
    {
        var labels = type switch
        {
            CredentialType.IdentityDocument => QrFieldDefinitions.IdentityDocumentMandatoryFields,
            CredentialType.DriversLicense => QrFieldDefinitions.DriversLicenseMandatoryFields,
            _ => throw new ArgumentOutOfRangeException(nameof(type), type, "Unknown credential type."),
        };

        return labels.Select(label => ClaimNameFor(type, label)).ToList();
    }

    public static bool IsIncludedOffline(string claimName) => !ExcludedFromOffline.Contains(claimName);
}