using System.Collections.Frozen;

namespace Application.Common.Services;

public static class EmergencyClaimNames
{
    public const string Vct = "urn:flashid:emergency-profile:1";

    public const int RevocationIndexOffset = 1_000_000_000;

    public const string FullName = "full_name";
    public const string Allergies = "allergies";
    public const string Medication = "medication";
    public const string Implants = "implants";
    public const string MedicalConditions = "medical_conditions";
    public const string BloodType = "blood_type";
    public const string CommunicationNeeds = "communication_needs";
    public const string MedicalAidScheme = "medical_aid_scheme";
    public const string MedicalAidNumber = "medical_aid_number";
    public const string MedicalUpdatedOn = "medical_updated_on";

    public const string NameField = "name";
    public const string ContactsField = "contacts";
    public const int MaxOfflineContacts = 3;

    public static string ContactClaim(int position, string part) => $"contact_{position}_{part}";

    public static readonly IReadOnlyList<string> MandatoryClaims = [MedicalUpdatedOn];

    private static readonly FrozenDictionary<string, string> FieldToClaim = new Dictionary<string, string>
    {
        ["name"] = FullName,
        ["allergies"] = Allergies,
        ["medication"] = Medication,
        ["implants"] = Implants,
        ["conditions"] = MedicalConditions,
        ["bloodType"] = BloodType,
        ["communication"] = CommunicationNeeds,
        ["medicalAidScheme"] = MedicalAidScheme,
        ["medicalAidNumber"] = MedicalAidNumber,
    }.ToFrozenDictionary();

    public static string? ClaimNameFor(string fieldKey) =>
        FieldToClaim.TryGetValue(fieldKey, out var claimName) ? claimName : null;
}
