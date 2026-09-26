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

    public DisclosedFieldSource Describe(Credential credential, string field)
    {
        ArgumentNullException.ThrowIfNull(credential);

        return field switch
        {
            "Identity number" => DisclosedFieldSource.Text(credential.Citizen.SaId),
            "SA ID number" => DisclosedFieldSource.Text(credential.Citizen.SaId),
            "Full surname" => DisclosedFieldSource.Text(credential.Citizen.Surname),
            "Full forenames" => DisclosedFieldSource.Text(credential.Citizen.Names),
            "Full name" => DisclosedFieldSource.Text($"{credential.Citizen.Names} {credential.Citizen.Surname}"),
            "Date of birth" => DisclosedFieldSource.Text(credential.Citizen.DateOfBirth.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)),
            "Gender" => DisclosedFieldSource.Text(credential.Citizen.Gender.ToString()),
            "Citizenship status" => DisclosedFieldSource.Text(credential.IdentityDocument?.Citizenship),
            "Country of birth" => DisclosedFieldSource.Text(credential.IdentityDocument?.CountryOfBirth),
            "Photograph" => DisclosedFieldSource.Photo(credential.IdentityDocument?.PhotoPath),
            "Photo" => DisclosedFieldSource.Photo(credential.DriversLicense?.PhotoPath),
            "Signature" => DisclosedFieldSource.Photo(credential.Signature),
            "Card issue date and number" => DisclosedFieldSource.Text(string.Empty),
            "License number" => DisclosedFieldSource.Text(credential.DriversLicense?.LicenseNumber),
            "License code" => DisclosedFieldSource.Text(credential.DriversLicense?.LicenseCode.ToString()),
            "Expiry date" => DisclosedFieldSource.Text(credential.DriversLicense?.ExpiryDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)),
            "Country of issue" => DisclosedFieldSource.Text(credential.DriversLicense?.CountryOfIssue),
            "Vehicle restrictions" => DisclosedFieldSource.Text(credential.DriversLicense?.Restrictions),
            "Date of issue" => DisclosedFieldSource.Text(credential.IssueDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)),
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