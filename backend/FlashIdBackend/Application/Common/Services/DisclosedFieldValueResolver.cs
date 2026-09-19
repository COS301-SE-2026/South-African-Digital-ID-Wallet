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

    public DisclosedFieldSource Describe(Credential cred, string field)
    {
        ArgumentNullException.ThrowIfNull(cred);

        return field switch
        {
            "Identity number" => DisclosedFieldSource.Text(cred.Citizen.SaId),
            "SA ID number" => DisclosedFieldSource.Text(cred.Citizen.SaId),
            "Full surname" => DisclosedFieldSource.Text(cred.Citizen.Surname),
            "Full forenames" => DisclosedFieldSource.Text(cred.Citizen.Names),
            "Full name" => DisclosedFieldSource.Text($"{cred.Citizen.Names} {cred.Citizen.Surname}"),
            "Date of birth" => DisclosedFieldSource.Text(cred.Citizen.DateOfBirth.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)),
            "Gender" => DisclosedFieldSource.Text(cred.Citizen.Gender.ToString()),
            "Citizenship status" => DisclosedFieldSource.Text(cred.IdentityDocument?.Citizenship),
            "Country of birth" => DisclosedFieldSource.Text(cred.IdentityDocument?.CountryOfBirth),
            "Photograph" => DisclosedFieldSource.Photo(cred.IdentityDocument?.PhotoPath),
            "Photo" => DisclosedFieldSource.Photo(cred.DriversLicense?.PhotoPath),
            "Signature" => DisclosedFieldSource.Photo(cred.Signature),
            "Card issue date and number" => DisclosedFieldSource.Text(string.Empty),
            "License number" => DisclosedFieldSource.Text(cred.DriversLicense?.LicenseNumber),
            "License code" => DisclosedFieldSource.Text(cred.DriversLicense?.LicenseCode.ToString()),
            "Expiry date" => DisclosedFieldSource.Text(cred.DriversLicense?.ExpiryDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)),
            "Country of issue" => DisclosedFieldSource.Text(cred.DriversLicense?.CountryOfIssue),
            "Vehicle restrictions" => DisclosedFieldSource.Text(cred.DriversLicense?.Restrictions),
            "Date of issue" => DisclosedFieldSource.Text(cred.IssueDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)),
            _ => throw new InvalidOperationException($"No resolver defined for this disclosed field: '{field}'."),
        };
    }

    private async Task<string> ResolveFieldAsync(Credential cred, string field)
    {
        var source = Describe(cred, field);

        // Online callers get a short-lived SAS URL. The blob itself is never read here.
        return source.Kind == DisclosedFieldKind.Photo
            ? await ResolvePhotoAsync(source.Value)
            : source.Value;
    }

    private async Task<string> ResolvePhotoAsync(string? blobName) =>
        string.IsNullOrEmpty(blobName) ? string.Empty : await _photoStorageProvider.GenerateReadSasUrlAsync(blobName, PhotoSasTtl);
}