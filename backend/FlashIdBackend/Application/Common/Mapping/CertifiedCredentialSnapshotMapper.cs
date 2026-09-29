using Application.Features.CertifiedCredentialCopies.Models;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class CertifiedCredentialSnapshotMapper
{
    public CertifiedCredentialSnapshot MapDriversLicense(Credential credential)
    {
        ArgumentNullException.ThrowIfNull(credential);
        ArgumentNullException.ThrowIfNull(credential.DriversLicense);
        ArgumentNullException.ThrowIfNull(credential.Citizen);

        var snapshot = MapDriversLicenseDetails(credential.DriversLicense);

        MapCommonDetails(credential, snapshot);

        snapshot.CredentialType = "DriversLicense";

        snapshot.LicenseCode = credential.DriversLicense.LicenseCode.ToString();

        return snapshot;
    }

    public CertifiedCredentialSnapshot MapIdentityDocument(Credential credential)
    {
        ArgumentNullException.ThrowIfNull(credential);
        ArgumentNullException.ThrowIfNull(credential.IdentityDocument);
        ArgumentNullException.ThrowIfNull(credential.Citizen);

        var snapshot = MapIdentityDocumentDetails(credential.IdentityDocument);

        MapCommonDetails(credential, snapshot);

        snapshot.CredentialType = "IdentityDocument";

        return snapshot;
    }

    private static void MapCommonDetails(Credential credential, CertifiedCredentialSnapshot snapshot)
    {
        snapshot.CredentialId = credential.Id;
        snapshot.IssuedBy = credential.IssuedBy;
        snapshot.IssueDate = credential.IssueDate;

        snapshot.FullName = $"{credential.Citizen.Names} {credential.Citizen.Surname}".Trim();

        snapshot.IdNumber = credential.Citizen.SaId;
        snapshot.DateOfBirth = credential.Citizen.DateOfBirth;
    }

    [MapperIgnoreSource(nameof(DriversLicense.Id))]
    [MapperIgnoreSource(nameof(DriversLicense.CredentialId))]
    [MapperIgnoreSource(nameof(DriversLicense.Credential))]
    [MapperIgnoreSource(nameof(DriversLicense.CreatedAt))]
    [MapperIgnoreSource(nameof(DriversLicense.UpdatedAt))]

    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.CredentialId))]
    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.CredentialType))]
    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.IssuedBy))]
    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.IssueDate))]
    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.FullName))]
    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.IdNumber))]
    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.DateOfBirth))]

    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.Citizenship))]
    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.CountryOfBirth))]
    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.Nationality))]
    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.LicenseCode))]
    private partial CertifiedCredentialSnapshot MapDriversLicenseDetails(
        DriversLicense source);

    [MapperIgnoreSource(nameof(IdentityDocument.Id))]
    [MapperIgnoreSource(nameof(IdentityDocument.CredentialId))]
    [MapperIgnoreSource(nameof(IdentityDocument.Credential))]
    [MapperIgnoreSource(nameof(IdentityDocument.Status))]
    [MapperIgnoreSource(nameof(IdentityDocument.CreatedAt))]
    [MapperIgnoreSource(nameof(IdentityDocument.UpdatedAt))]

    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.CredentialId))]
    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.CredentialType))]
    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.IssuedBy))]
    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.IssueDate))]
    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.FullName))]
    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.IdNumber))]
    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.DateOfBirth))]

    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.LicenseNumber))]
    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.LicenseCode))]
    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.Restrictions))]
    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.ExpiryDate))]
    [MapperIgnoreTarget(nameof(CertifiedCredentialSnapshot.CountryOfIssue))]
    private partial CertifiedCredentialSnapshot MapIdentityDocumentDetails(
        IdentityDocument source);
}