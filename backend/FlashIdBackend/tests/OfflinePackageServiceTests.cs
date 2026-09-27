using System.Buffers.Text;
using System.Text;
using System.Text.Json.Nodes;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Services;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Exceptions;
using Domain.Entities;
using Domain.Enums;

namespace tests;

public class OfflinePackageServiceTests
{
    private static readonly DateTimeOffset Now = new(2026, 9, 20, 9, 0, 0, TimeSpan.Zero);
    private static readonly Guid OwnerUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    private sealed class FixedTimeProvider(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }

    private sealed class FakeOfflinePackageRepository : IOfflinePackageRepository
    {

        private int _nextIndex = 1;

        public Credential? Stored { get; set; }
        public bool AlwaysFailSaves { get; set; }
        public int FailNextSaves { get; set; }
        public int SaveAttempts { get; private set; }
        public List<int> AllocatedIndexes { get; } = [];
        public List<AuditLog> AuditLogs { get; } = [];
        public bool DiscardedChanges { get; private set; }

        public Task<Credential?> GetForPackagingAsync(Guid credentialId, CancellationToken cancellationToken) =>
            Task.FromResult(Stored?.Id == credentialId ? Stored : null);

        public Task<int> NextRevocationIndexAsync(CancellationToken cancellationToken)
        {
            var index = _nextIndex++;
            AllocatedIndexes.Add(index);

            return Task.FromResult(index);
        }

        public Task<bool> TrySaveMintedPackageAsync(CancellationToken cancellationToken)
        {
            SaveAttempts++;

            if (AlwaysFailSaves)
            {
                return Task.FromResult(false);
            }

            if (FailNextSaves > 0)
            {
                FailNextSaves--;
                return Task.FromResult(false);
            }

            return Task.FromResult(true);
        }

        public Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken)
        {
            AuditLogs.Add(auditLog);

            return Task.CompletedTask;
        }

        public Task SaveAuditLogDiscardingChangesAsync(AuditLog auditLog, CancellationToken cancellationToken)
        {
            DiscardedChanges = true;
            AuditLogs.Add(auditLog);

            return Task.CompletedTask;
        }
    }

    private sealed class FakePhotoStorageProvider : IPhotoStorageProvider
    {
        public bool BlobExists { get; set; } = true;

        public Task<string> GenerateReadSasUrlAsync(string blobName, TimeSpan ttl) => Task.FromResult($"https://fake-blob-sas.local/{blobName}");

        public Exception? ThrowOnOpen { get; set; }

        public Task<Stream?> OpenReadAsync(string blobName, CancellationToken cancellationToken) =>
            ThrowOnOpen is not null
                ? Task.FromException<Stream?>(ThrowOnOpen)
                : Task.FromResult<Stream?>(BlobExists ? new MemoryStream([1, 2, 3, 4]) : null);
    }

    private sealed class FakePortraitProcessor : IPortraitProcessor
    {
        public byte[] Portrait { get; set; } = [0x52, 0x49, 0x46, 0x46, 0x57, 0x45, 0x42, 0x50];

        public Exception? ThrowOnProcess { get; set; }

        public Task<byte[]> ToOfflinePortraitAsync(Stream source, CancellationToken cancellationToken) =>
            ThrowOnProcess is not null ? Task.FromException<byte[]>(ThrowOnProcess) : Task.FromResult(Portrait);
    }

    private static OfflinePackageService CreateService(
        FakeOfflinePackageRepository repository,
        TestSigningProvider signingProvider,
        FakePhotoStorageProvider? photoStorage = null,
        FakePortraitProcessor? portraitProcessor = null)
    {

        var storage = photoStorage ?? new FakePhotoStorageProvider();
        var timeProvider = new FixedTimeProvider(Now);

        return new OfflinePackageService(
            repository,
            new DisclosedFieldValueResolver(storage),
            storage,
            portraitProcessor ?? new FakePortraitProcessor(),
            new SdJwtCredentialFactory(signingProvider, timeProvider),
            signingProvider,
            timeProvider);
    }

    private static Credential DriversLicenseCredential()
    {
        var citizen = new Citizen
        {

            Id = Guid.NewGuid(),
            UserId = OwnerUserId,
            SaId = "0000000000000",
            Names = "Thabo",
            Surname = "Mokoena",
            DateOfBirth = new DateTime(1998, 3, 14, 0, 0, 0, DateTimeKind.Utc),
            Gender = Gender.Male,
        };

        var credential = new Credential
        {

            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Citizen = citizen,
            Status = CredentialStatus.Active,
            IssueDate = new DateTime(2024, 1, 15, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = Now.AddDays(-60).UtcDateTime,
            Signature = "signature.png",
        };

        credential.DriversLicense = new DriversLicense
        {

            Id = Guid.NewGuid(),
            CredentialId = credential.Id,
            Credential = credential,
            LicenseNumber = "FAKE-1234",
            LicenseCode = LicenseCode.B,
            Restrictions = "0",
            ExpiryDate = Now.AddYears(2).UtcDateTime,
            PhotoPath = "license-photo.jpg",
            CountryOfIssue = "South Africa",
        };

        return credential;
    }

    private static Credential IdentityDocumentCredential()
    {
        var credential = DriversLicenseCredential();
        credential.DriversLicense = null;

        credential.IdentityDocument = new IdentityDocument
        {
            Id = Guid.NewGuid(),
            CredentialId = credential.Id,
            Credential = credential,
            Citizenship = "Citizen",
            CountryOfBirth = "South Africa",
            Nationality = "South African",
            PhotoPath = "id-photo.jpg",
        };

        return credential;
    }

    private static void GivenStoredPackage(Credential credential, DateTimeOffset signedAt, string signingKid = "test-key-1", string? thumbprint = null)
    {

        credential.IssuerSignedCredential = "stored.issuer.jwt";
        credential.DisclosureSet = "{\"full_name\":\"stored-disclosure\"}";
        credential.SigningKid = signingKid;
        credential.HolderKeyThumbprint = thumbprint;
        credential.SignedAt = signedAt;
        credential.PackageExpiresAt = signedAt.AddDays(30);
        credential.RevocationIndex = 99;
    }

    private static string ClaimValue(OfflinePackageResponseDto package, string claimName)
    {
        var parts = JsonNode.Parse(Encoding.UTF8.GetString(Base64Url.DecodeFromChars(package.Disclosures[claimName])))!.AsArray();

        return parts[2]!.GetValue<string>();
    }

    private static JsonObject Payload(string issuerJwt) =>
        JsonNode.Parse(Encoding.UTF8.GetString(Base64Url.DecodeFromChars(issuerJwt.Split('.')[1])))!.AsObject();

    [Fact]
    public async Task GetOrMintAsync_NeverMinted_SignsAndStoresThePackage()
    {
        var credential = DriversLicenseCredential();
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        using var signingProvider = new TestSigningProvider();

        var package = await CreateService(repository, signingProvider)
            .GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken);

        Assert.Equal(1, repository.SaveAttempts);
        Assert.Equal(1, credential.RevocationIndex);
        Assert.Equal("test-key-1", credential.SigningKid);
        Assert.Equal(Now, credential.SignedAt);
        Assert.Equal(Now.AddDays(30), credential.PackageExpiresAt);
        Assert.Equal(credential.IssuerSignedCredential, package.IssuerSignedCredential);
    }

    [Fact]
    public async Task GetOrMintAsync_FreshPackageStored_ReturnsItWithoutMinting()
    {
        var credential = DriversLicenseCredential();
        GivenStoredPackage(credential, Now.AddDays(-1));
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        using var signingProvider = new TestSigningProvider();

        var package = await CreateService(repository, signingProvider)
            .GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken);

        Assert.Equal(0, repository.SaveAttempts);
        Assert.Equal("stored.issuer.jwt", package.IssuerSignedCredential);
        Assert.Equal(99, credential.RevocationIndex);
    }

    [Fact]
    public async Task GetOrMintAsync_PackageExpired_MintsAgain()
    {
        var credential = DriversLicenseCredential();
        GivenStoredPackage(credential, Now.AddDays(-31));
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        using var signingProvider = new TestSigningProvider();

        await CreateService(repository, signingProvider).GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken);

        Assert.Equal(1, repository.SaveAttempts);
        Assert.NotEqual("stored.issuer.jwt", credential.IssuerSignedCredential);
    }

    [Fact]
    public async Task GetOrMintAsync_PackageOlderThanSevenDays_MintsAgain()
    {
        var credential = DriversLicenseCredential();
        GivenStoredPackage(credential, Now.AddDays(-8));
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        using var signingProvider = new TestSigningProvider();

        await CreateService(repository, signingProvider).GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken);

        Assert.Equal(1, repository.SaveAttempts);
    }

    [Fact]
    public async Task GetOrMintAsync_SigningKeyChanged_MintsAgain()
    {

        var credential = DriversLicenseCredential();
        GivenStoredPackage(credential, Now.AddDays(-1), signingKid: "retired-key");
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        using var signingProvider = new TestSigningProvider();

        await CreateService(repository, signingProvider).GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken);

        Assert.Equal(1, repository.SaveAttempts);
        Assert.Equal("test-key-1", credential.SigningKid);
    }

    [Fact]
    public async Task GetOrMintAsync_DeviceKeyChanged_MintsAgain()
    {

        var credential = DriversLicenseCredential();
        GivenStoredPackage(credential, Now.AddDays(-1), thumbprint: "a-different-phone");
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        using var signingProvider = new TestSigningProvider();

        await CreateService(repository, signingProvider).GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken);

        Assert.Equal(1, repository.SaveAttempts);
        Assert.Null(credential.HolderKeyThumbprint);
    }

    [Fact]
    public async Task GetOrMintAsync_CredentialUpdatedSinceSigning_MintsAgain()
    {
        var credential = DriversLicenseCredential();
        GivenStoredPackage(credential, Now.AddDays(-2));
        credential.UpdatedAt = Now.AddDays(-1).UtcDateTime;
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        using var signingProvider = new TestSigningProvider();

        await CreateService(repository, signingProvider).GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken);

        Assert.Equal(1, repository.SaveAttempts);
    }

    [Fact]
    public async Task GetOrMintAsync_DriversLicense_ExcludesTheSignatureImage()
    {

        var credential = DriversLicenseCredential();
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        using var signingProvider = new TestSigningProvider();

        var package = await CreateService(repository, signingProvider)
            .GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken);

        Assert.DoesNotContain(SdJwtClaimNames.SignatureImage, package.Disclosures.Keys);
        Assert.Contains(SdJwtClaimNames.Portrait, package.Disclosures.Keys);
    }

    [Fact]
    public async Task GetOrMintAsync_DriversLicense_CarriesTheProcessedPortrait()
    {

        var credential = DriversLicenseCredential();
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        var processor = new FakePortraitProcessor();
        using var signingProvider = new TestSigningProvider();

        var package = await CreateService(repository, signingProvider, portraitProcessor: processor)
            .GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken);

        Assert.Equal(processor.Portrait, Base64Url.DecodeFromChars(ClaimValue(package, SdJwtClaimNames.Portrait)));
    }

    [Fact]
    public async Task GetOrMintAsync_OptionalFieldWithNoValue_OmitsTheClaim()
    {

        var credential = DriversLicenseCredential();
        credential.DriversLicense!.CountryOfIssue = string.Empty;
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        using var signingProvider = new TestSigningProvider();

        var package = await CreateService(repository, signingProvider)
            .GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken);

        Assert.DoesNotContain(SdJwtClaimNames.CountryOfIssue, package.Disclosures.Keys);
        Assert.Contains(SdJwtClaimNames.LicenseNumber, package.Disclosures.Keys);
    }

    [Fact]
    public async Task GetOrMintAsync_PortraitBlobMissing_ThrowsAndStoresNothing()
    {

        var credential = DriversLicenseCredential();
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        using var signingProvider = new TestSigningProvider();
        var storage = new FakePhotoStorageProvider { BlobExists = false };

        await Assert.ThrowsAsync<OfflinePackageDataMissingException>(
            () => CreateService(repository, signingProvider, storage).GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken));

        Assert.Equal(0, repository.SaveAttempts);
        Assert.Null(credential.IssuerSignedCredential);
        Assert.Null(credential.RevocationIndex);
    }

    [Fact]
    public async Task GetOrMintAsync_RevocationIndexCollision_RetriesWithAFreshIndex()
    {

        var credential = DriversLicenseCredential();
        var repository = new FakeOfflinePackageRepository { Stored = credential, FailNextSaves = 2 };
        using var signingProvider = new TestSigningProvider();

        var package = await CreateService(repository, signingProvider)
            .GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken);

        Assert.Equal(3, repository.SaveAttempts);
        Assert.Equal([1, 2, 3], repository.AllocatedIndexes);
        Assert.Equal(3, credential.RevocationIndex);

        // The index is signed into the credential, so the stored signature must match the final index.
        Assert.Equal(3, Payload(package.IssuerSignedCredential)["ri"]!.GetValue<int>());
    }

    [Fact]
    public async Task GetOrMintAsync_RevocationIndexCollidesEveryAttempt_ThrowsOfflinePackageUnavailable()
    {

        var credential = DriversLicenseCredential();
        var repository = new FakeOfflinePackageRepository { Stored = credential, AlwaysFailSaves = true };
        using var signingProvider = new TestSigningProvider();

        await Assert.ThrowsAsync<OfflinePackageUnavailableException>(
            () => CreateService(repository, signingProvider).GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken));

        Assert.Equal(4, repository.SaveAttempts);
    }

    [Fact]
    public async Task GetOrMintAsync_IdentityDocument_UsesTheIdentityDocumentVct()
    {

        var credential = IdentityDocumentCredential();
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        using var signingProvider = new TestSigningProvider();

        var package = await CreateService(repository, signingProvider)
            .GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken);

        Assert.Equal(SdJwtClaimNames.IdentityDocumentVct, Payload(package.IssuerSignedCredential)["vct"]!.GetValue<string>());
        Assert.Contains(SdJwtClaimNames.CitizenshipStatus, package.Disclosures.Keys);
    }

    [Fact]
    public async Task GetOrMintAsync_DeviceKeyProvided_StoresTheThumbprintAndEmbedsCnf()
    {

        var credential = DriversLicenseCredential();
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        using var signingProvider = new TestSigningProvider();
        var deviceKey = signingProvider.ActiveKey.PublicJwk;

        var package = await CreateService(repository, signingProvider)
            .GetOrMintAsync(credential.Id, OwnerUserId, deviceKey, "196.25.1.10", TestContext.Current.CancellationToken);

        Assert.False(string.IsNullOrEmpty(credential.HolderKeyThumbprint));
        Assert.Equal(deviceKey.X, Payload(package.IssuerSignedCredential)["cnf"]!["jwk"]!["x"]!.GetValue<string>());
    }

    [Fact]
    public async Task GetOrMintAsync_RequestedByAnotherCitizen_ThrowsCredentialAccessDenied()
    {

        var credential = DriversLicenseCredential();
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        using var signingProvider = new TestSigningProvider();

        await Assert.ThrowsAsync<CredentialAccessDeniedException>(
            () => CreateService(repository, signingProvider).GetOrMintAsync(credential.Id, Guid.NewGuid(), null, "196.25.1.10", TestContext.Current.CancellationToken));

        Assert.Equal(0, repository.SaveAttempts);
    }

    [Fact]
    public async Task GetOrMintAsync_InactiveCredential_ThrowsCredentialNotActive()
    {

        var credential = DriversLicenseCredential();
        credential.Status = CredentialStatus.Revoked;
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        using var signingProvider = new TestSigningProvider();

        await Assert.ThrowsAsync<CredentialNotActiveException>(
            () => CreateService(repository, signingProvider).GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task GetOrMintAsync_UnknownCredential_ThrowsCredentialNotFound()
    {

        var repository = new FakeOfflinePackageRepository { Stored = DriversLicenseCredential() };
        using var signingProvider = new TestSigningProvider();

        await Assert.ThrowsAsync<CredentialNotFoundException>(
            () => CreateService(repository, signingProvider).GetOrMintAsync(Guid.NewGuid(), OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task GetOrMintAsync_Minted_WritesAnAuditEntryWithoutClaimValues()
    {
        var credential = DriversLicenseCredential();
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        using var signingProvider = new TestSigningProvider();

        await CreateService(repository, signingProvider).GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken);

        var entry = Assert.Single(repository.AuditLogs);

        Assert.Equal(AuditEventType.OfflinePackageMinted, entry.EventType);
        Assert.Equal(OwnerUserId, entry.ActorId);
        Assert.Equal(credential.Id, entry.CredentialId);
        Assert.Equal("196.25.1.10", entry.IpAddress);
        Assert.Contains(SdJwtClaimNames.Portrait, entry.Details, StringComparison.Ordinal);
        Assert.DoesNotContain("Mokoena", entry.Details, StringComparison.Ordinal);
        Assert.DoesNotContain("FAKE-1234", entry.Details, StringComparison.Ordinal);
        Assert.DoesNotContain("0000000000000", entry.Details, StringComparison.Ordinal);
    }

    [Fact]
    public async Task GetOrMintAsync_MintFails_WritesAFailureEntryAndDiscardsTheChanges()
    {
        var credential = DriversLicenseCredential();
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        using var signingProvider = new TestSigningProvider();
        var storage = new FakePhotoStorageProvider { BlobExists = false };

        await Assert.ThrowsAsync<OfflinePackageDataMissingException>(
            () => CreateService(repository, signingProvider, storage).GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken));

        var entry = Assert.Single(repository.AuditLogs);

        Assert.Equal(AuditEventType.OfflinePackageMintFailed, entry.EventType);
        Assert.True(repository.DiscardedChanges);
        Assert.Equal(0, repository.SaveAttempts);
    }

    [Fact]
    public async Task GetOrMintAsync_FreshPackageReused_WritesNoAuditEntry()
    {
        var credential = DriversLicenseCredential();
        GivenStoredPackage(credential, Now.AddDays(-1));
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        using var signingProvider = new TestSigningProvider();

        await CreateService(repository, signingProvider).GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken);

        Assert.Empty(repository.AuditLogs);
    }

    [Fact]
    public async Task GetOrMintAsync_ExpiredDriversLicense_ThrowsOfflinePackageDocumentExpired()
    {
        var credential = DriversLicenseCredential();
        credential.DriversLicense!.ExpiryDate = Now.AddDays(-1).UtcDateTime;
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        using var signingProvider = new TestSigningProvider();

        await Assert.ThrowsAsync<OfflinePackageDocumentExpiredException>(
            () => CreateService(repository, signingProvider).GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken));

        Assert.Equal(0, repository.SaveAttempts);
        Assert.Single(repository.AuditLogs);
    }

    [Fact]
    public async Task GetOrMintAsync_PortraitCannotBeProcessed_ThrowsDataMissingAndAudits()
    {
        var credential = DriversLicenseCredential();
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        using var signingProvider = new TestSigningProvider();
        var processor = new FakePortraitProcessor { ThrowOnProcess = new InvalidOperationException("corrupt image") };

        var exception = await Assert.ThrowsAsync<OfflinePackageDataMissingException>(
            () => CreateService(repository, signingProvider, portraitProcessor: processor).GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken));

        Assert.Contains(SdJwtClaimNames.Portrait, exception.Message, StringComparison.Ordinal);
        Assert.Equal(AuditEventType.OfflinePackageMintFailed, Assert.Single(repository.AuditLogs).EventType);
        Assert.Equal(0, repository.SaveAttempts);
    }

    [Fact]
    public async Task GetOrMintAsync_PhotoStorageUnreachable_ThrowsUnavailableSoTheWalletRetries()
    {
        var credential = DriversLicenseCredential();
        var repository = new FakeOfflinePackageRepository { Stored = credential };
        using var signingProvider = new TestSigningProvider();
        var storage = new FakePhotoStorageProvider { ThrowOnOpen = new HttpRequestException("blob storage unreachable") };

        await Assert.ThrowsAsync<OfflinePackageUnavailableException>(
            () => CreateService(repository, signingProvider, storage).GetOrMintAsync(credential.Id, OwnerUserId, null, "196.25.1.10", TestContext.Current.CancellationToken));

        Assert.Equal(0, repository.SaveAttempts);
    }
}
