using System.Globalization;
using Domain.Entities;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;

namespace Application.Common.Services;

public class DisclosedFieldValueResolver : IDisclosedFieldsValueResolver
{
    private static readonly TimeSpan PhotoSasTtl = TimeSpan.FromMinutes(5);
    private readonly IPhotoStorageProvider _photoStorageProvider;

    public DisclosedFieldValueResolver(IPhotoStorageProvider photoStorageProvider)
    {
        _photoStorageProvider = photoStorageProvider;
    }

    public async Task<Dictionary<string, string>> ResolveAsync(Credential cred, IEnumerable<string> disclosedFields)
    {
        var res = new Dictionary<string, string>();
        foreach (var dF in disclosedFields)
        {
            res[dF] = await ResolveFieldAsync(cred, dF);
        }

        return res;
    }

    private async Task<string> ResolveFieldAsync(Credential cred, string field) => field switch
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
        "Photograph" => await ResolvePhotoAsync(cred.IdentityDocument?.PhotoPath),
        "Photo" => await ResolvePhotoAsync(cred.DriversLicense?.PhotoPath),
        "Signature" => await ResolvePhotoAsync(cred.Signature),
        "Card issue date and number" => string.Empty,
        "License number" => cred.DriversLicense?.LicenseNumber ?? string.Empty,
        "License code" => cred.DriversLicense?.LicenseCode.ToString() ?? string.Empty,
        "Expiry date" => cred.DriversLicense?.ExpiryDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture) ?? string.Empty,
        "Country of issue" => cred.DriversLicense?.CountryOfIssue ?? string.Empty,
        "Vehicle restrictions" => cred.DriversLicense?.Restrictions ?? string.Empty,
        "Date of issue" => cred.IssueDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
        _ => throw new InvalidOperationException($"No resolver defined for this disclosed field: '{field}'."),
    };

    private async Task<string> ResolvePhotoAsync(string? blobName) =>
        string.IsNullOrEmpty(blobName) ? string.Empty : await _photoStorageProvider.GenerateReadSasUrlAsync(blobName, PhotoSasTtl);
}