using System.Globalization;
using Domain.Entities;

namespace Application.Common.Services;

public static class DisclosedFieldValueResolver
{
    public static Dictionary<string, string> Resolve(Credential cred, IEnumerable<string> disclosedFields)
    {
        var res = new Dictionary<string, string>();
        foreach (var dF in disclosedFields)
        {
            res[dF] = ResolveField(cred, dF);
        }

        return res;
    }

    private static string ResolveField(Credential cred, string field) => field switch
    {
        "Identity number" => cred.Citizen.SaId,
        "SA ID number" => cred.Citizen.SaId,
        "Full surname" => cred.Citizen.Surname,
        "Full forenames" => cred.Citizen.Names,
        "Full name" => $"{cred.Citizen.Names} {cred.Citizen.Surname}",
        "Date of birth" => cred.Citizen.DateOfBirth.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
        "Gender" => cred.Citizen.Gender.ToString(),
        "Citizenship status" => cred.IdentityDocument?.Citizenship ?? string.Empty,
        "Country of birth" => cred.IdentityDocument?.CountryOfBirth ?? string.Empty,
        "Photograph" => cred.IdentityDocument?.PhotoPath ?? string.Empty,
        "Photo" => cred.DriversLicense?.PhotoPath ?? string.Empty,
        "Signature" => string.Empty, // placeholder for future implementation
        "Card issue date and number" => string.Empty,
        "License number" => cred.DriversLicense?.LicenseNumber ?? string.Empty,
        "License code" => cred.DriversLicense?.LicenseCode.ToString() ?? string.Empty,
        "Expiry date" => cred.DriversLicense?.ExpiryDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture) ?? string.Empty,
        "Country of issue" => cred.DriversLicense?.CountryOfIssue ?? string.Empty,
        "Vehicle restrictions" => cred.DriversLicense?.Restrictions ?? string.Empty,
        "Date of issue" => cred.IssueDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
        _ => throw new InvalidOperationException($"No resolver defined for this disclosed field: '{field}'."),
    };
}