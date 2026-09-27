using Application.Common.Interfaces.GatewayInterfaces;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Services;
using Application.Features.Credentials.DTOs;
using Application.Features.Onboarding.Dtos;
using Application.Features.Verification.Dtos;
using Application.Features.Verification.Exceptions;
using Domain.Entities;
using Domain.Enums;

namespace tests;

public class PhysicalIdentityVerificationServiceTests
{
    private const string ValidSaId = "9001015800085";
    private const string OtherSaId = "8505124800083";
    private const string AzureSessionId = "azure-liveness-session-1";

    private sealed class FakePhysicalIdentityVerificationRepository : IPhysicalIdentityVerificationRepository
    {
        public PhysicalIdentityVerification? VerificationById;
        public PhysicalIdentityVerification? ActiveForUser;
        public Citizen? CitizenBySaId;
        public Citizen? CitizenByUserId;

        public List<PhysicalIdentityVerification> Added = new();
        public List<Citizen> AddedCitizens = new();
        public int Saves;

        public Task<Citizen?> GetCitizenBySaIdAsync(string saId, CancellationToken cancellationToken) =>
            Task.FromResult(CitizenBySaId);

        public Task<Citizen?> GetCitizenByUserIdAsync(Guid userId, CancellationToken cancellationToken) =>
            Task.FromResult(CitizenByUserId);

        public Task<User?> GetUserByEmailAsync(string email) => Task.FromResult<User?>(null);

        public Task AddCitizenAsync(Citizen citizen, CancellationToken cancellationToken)
        {
            AddedCitizens.Add(citizen);
            return Task.CompletedTask;
        }

        public Task<PhysicalIdentityVerification?> GetByIdAsync(Guid verificationId, CancellationToken cancellationToken) =>
            Task.FromResult(VerificationById);

        public Task<PhysicalIdentityVerification?> GetActiveForUserAsync(Guid userId, CancellationToken cancellationToken) =>
            Task.FromResult(ActiveForUser);

        public Task AddAsync(PhysicalIdentityVerification verification, CancellationToken cancellationToken)
        {
            Added.Add(verification);
            return Task.CompletedTask;
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            Saves++;
            return Task.CompletedTask;
        }
    }

    private sealed class FakeFaceLivenessServiceProvider : IFaceLivenessServiceProvider
    {
        public CreateLivenessSessionResult SessionToReturn = new() { SessionId = AzureSessionId, AuthToken = "auth-token" };
        public LivenessVerificationResult ResultToReturn = new() { Status = "Succeeded", IsComplete = true, LivenessPassed = true, FaceMatched = true };
        public string? LastContentType;
        public string? LastSessionId;
        public int CreateCalls;

        public Task<CreateLivenessSessionResult> CreateLivenessWithVerifySessionAsync(
            Stream referenceImage,
            string contentType,
            Guid deviceCorrelationId,
            CancellationToken cancellationToken)
        {
            CreateCalls++;
            LastContentType = contentType;
            return Task.FromResult(SessionToReturn);
        }

        public Task<LivenessVerificationResult> GetLivenessWithVerifyResultAsync(string sessionId, CancellationToken cancellationToken)
        {
            LastSessionId = sessionId;
            return Task.FromResult(ResultToReturn);
        }
    }

    private sealed class FakeGovernmentRegistryGateway : IGovernmentRegistryGateway
    {
        public CitizenRecordDto? CitizenToReturn;
        public List<string> RequestedSaIds = new();

        public Task<CitizenRecordDto?> GetCitizenBySaIdAsync(string saId)
        {
            RequestedSaIds.Add(saId);
            return Task.FromResult(CitizenToReturn);
        }

        public Task<GovernmentRegistryIdentityDocumentDto?> GetIdentityDocumentBySaIdAsync(string saId, CancellationToken cancellationToken) =>
            throw new NotImplementedException("Not exercised by these tests.");

        public Task<GovernmentRegistryDriversLicenseDto?> GetDriversLicenseBySaIdAsync(string saId, CancellationToken cancellationToken) =>
            throw new NotImplementedException("Not exercised by these tests.");
    }

    private sealed class FakePhotoStorageProvider : IPhotoStorageProvider
    {
        public bool ReturnNullStream;
        public List<string> OpenedBlobs = new();

        public Task<string> GenerateReadSasUrlAsync(string blobName, TimeSpan ttl) =>
            Task.FromResult($"https://example.test/{blobName}");

        public Task<Stream?> OpenReadAsync(string blobName, CancellationToken cancellationToken)
        {
            OpenedBlobs.Add(blobName);
            return Task.FromResult<Stream?>(ReturnNullStream ? null : new MemoryStream(new byte[] { 1, 2, 3 }));
        }
    }

    private sealed class Ctx
    {
        public FakePhysicalIdentityVerificationRepository Repo = null!;
        public FakeFaceLivenessServiceProvider Face = null!;
        public FakeGovernmentRegistryGateway Registry = null!;
        public FakePhotoStorageProvider Photos = null!;
        public PhysicalIdentityVerificationService Service = null!;
    }

    private static Ctx Setup()
    {
        var repo = new FakePhysicalIdentityVerificationRepository();
        var face = new FakeFaceLivenessServiceProvider();
        var registry = new FakeGovernmentRegistryGateway();
        var photos = new FakePhotoStorageProvider();

        return new Ctx
        {
            Repo = repo,
            Face = face,
            Registry = registry,
            Photos = photos,
            Service = new PhysicalIdentityVerificationService(repo, face, registry, photos),
        };
    }

    private static PhysicalIdentityVerification CreateVerification(
        Guid userId,
        IdentityVerificationStatus status = IdentityVerificationStatus.AwaitingConsent,
        int expiresInMinutes = 15,
        bool consentGranted = false,
        string? submittedSaId = null,
        string? azureSessionId = null,
        bool? registryIdentityMatched = null) => new()
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Status = status,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expiresInMinutes),
            ConsentGrantedAt = consentGranted ? DateTime.UtcNow : null,
            SubmittedSaId = submittedSaId,
            AzureLivenessSessionId = azureSessionId,
            RegistryIdentityMatched = registryIdentityMatched,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

    private static CitizenRecordDto RegistryCitizen(string? photoBlobName = "portrait.jpg", string? gender = "Female") => new()
    {
        SaId = ValidSaId,
        Names = "Thandiwe",
        Surname = "Dlamini",
        DateOfBirth = new DateTime(1990, 1, 1),
        Gender = gender,
        PhotoBlobName = photoBlobName,
    };

    private static Citizen ExistingCitizen(Guid? userId) => new()
    {
        Id = Guid.NewGuid(),
        SaId = ValidSaId,
        Names = "Thandiwe",
        Surname = "Dlamini",
        DateOfBirth = new DateTime(1990, 1, 1),
        Status = CitizenStatus.Pending,
        UserId = userId,
    };

    private static Ctx SetupReadyForLiveness(Guid userId, out PhysicalIdentityVerification verification)
    {
        var c = Setup();
        verification = CreateVerification(
            userId,
            IdentityVerificationStatus.AwaitingDocument,
            consentGranted: true);

        c.Repo.VerificationById = verification;
        c.Registry.CitizenToReturn = RegistryCitizen();
        return c;
    }

    [Fact]
    public async Task StartAsync_WithNoExistingSession_CreatesOneAwaitingConsentForFifteenMinutes()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var before = DateTime.UtcNow;

        var result = await c.Service.StartAsync(userId, TestContext.Current.CancellationToken);

        var created = Assert.Single(c.Repo.Added);
        Assert.Equal(userId, created.UserId);
        Assert.Equal(IdentityVerificationStatus.AwaitingConsent, result.Status);
        Assert.Equal(created.Id, result.VerificationId);
        Assert.InRange(result.ExpiresAt, before.AddMinutes(15), DateTime.UtcNow.AddMinutes(15));
    }

    [Fact]
    public async Task StartAsync_WithLiveSession_ReturnsItWithoutCreatingAnother()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var existing = CreateVerification(userId, IdentityVerificationStatus.AwaitingDocument);
        c.Repo.ActiveForUser = existing;

        var result = await c.Service.StartAsync(userId, TestContext.Current.CancellationToken);

        Assert.Equal(existing.Id, result.VerificationId);
        Assert.Equal(IdentityVerificationStatus.AwaitingDocument, result.Status);
        Assert.Empty(c.Repo.Added);
        Assert.Equal(0, c.Repo.Saves);
    }

    [Fact]
    public async Task StartAsync_WithStaleSession_ExpiresItAndCreatesAReplacement()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var stale = CreateVerification(userId, IdentityVerificationStatus.AwaitingDocument, expiresInMinutes: -1);
        c.Repo.ActiveForUser = stale;

        var result = await c.Service.StartAsync(userId, TestContext.Current.CancellationToken);

        Assert.Equal(IdentityVerificationStatus.Expired, stale.Status);
        var created = Assert.Single(c.Repo.Added);
        Assert.Equal(created.Id, result.VerificationId);
        Assert.NotEqual(stale.Id, result.VerificationId);
        Assert.Equal(2, c.Repo.Saves);
    }

    [Fact]
    public async Task GrantConsentAsync_WhenSessionDoesNotExist_ThrowsVerificationNotFound()
    {
        var c = Setup();

        await Assert.ThrowsAsync<VerificationNotFoundException>(
            () => c.Service.GrantConsentAsync(Guid.NewGuid(), Guid.NewGuid(), TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task GrantConsentAsync_WhenSessionBelongsToAnotherUser_ThrowsVerificationNotFound()
    {
        var c = Setup();
        var verification = CreateVerification(Guid.NewGuid());
        c.Repo.VerificationById = verification;

        await Assert.ThrowsAsync<VerificationNotFoundException>(
            () => c.Service.GrantConsentAsync(verification.Id, Guid.NewGuid(), TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task GrantConsentAsync_WhenSessionHasTimedOut_ThrowsVerificationExpired()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(userId, expiresInMinutes: -1);
        c.Repo.VerificationById = verification;

        await Assert.ThrowsAsync<VerificationExpiredException>(
            () => c.Service.GrantConsentAsync(verification.Id, userId, TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task GrantConsentAsync_WhenSessionIsMarkedExpired_ThrowsVerificationExpired()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(userId, IdentityVerificationStatus.Expired);
        c.Repo.VerificationById = verification;

        await Assert.ThrowsAsync<VerificationExpiredException>(
            () => c.Service.GrantConsentAsync(verification.Id, userId, TestContext.Current.CancellationToken));
    }

    [Theory]
    [InlineData(IdentityVerificationStatus.Verified)]
    [InlineData(IdentityVerificationStatus.Failed)]
    public async Task GrantConsentAsync_WhenSessionAlreadyCompleted_ThrowsInvalidVerificationState(
        IdentityVerificationStatus status)
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(userId, status);
        c.Repo.VerificationById = verification;

        var ex = await Assert.ThrowsAsync<InvalidVerificationState>(
            () => c.Service.GrantConsentAsync(verification.Id, userId, TestContext.Current.CancellationToken));

        Assert.Contains("already completed", ex.Message);
    }

    [Fact]
    public async Task GrantConsentAsync_FromAwaitingConsent_RecordsConsentAndAdvancesToAwaitingDocument()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(userId);
        c.Repo.VerificationById = verification;
        var before = DateTime.UtcNow;

        var result = await c.Service.GrantConsentAsync(verification.Id, userId, TestContext.Current.CancellationToken);

        Assert.Equal(IdentityVerificationStatus.AwaitingDocument, result.Status);
        Assert.NotNull(verification.ConsentGrantedAt);
        Assert.InRange(verification.ConsentGrantedAt!.Value, before, DateTime.UtcNow);
        Assert.Equal(1, c.Repo.Saves);
    }

    [Fact]
    public async Task GrantConsentAsync_WhenConsentAlreadyGranted_ThrowsInvalidVerificationState()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(userId, IdentityVerificationStatus.AwaitingDocument, consentGranted: true);
        c.Repo.VerificationById = verification;

        var ex = await Assert.ThrowsAsync<InvalidVerificationState>(
            () => c.Service.GrantConsentAsync(verification.Id, userId, TestContext.Current.CancellationToken));

        Assert.Contains("no longer awaiting consent", ex.Message);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("     ")]
    [InlineData("123")]
    [InlineData("900101580008")]
    [InlineData("90010158000855")]
    [InlineData("90010158000AB")]
    [InlineData("9001-015800085")]
    public async Task CreateLivenessSessionAsync_WithMalformedSaId_ThrowsBeforeTouchingTheRegistry(string? saId)
    {
        var c = Setup();

        var ex = await Assert.ThrowsAsync<InvalidVerificationState>(
            () => c.Service.CreateLivenessSessionAsync(
                Guid.NewGuid(), Guid.NewGuid(), saId!, TestContext.Current.CancellationToken));

        Assert.Contains("13-digit", ex.Message);
        Assert.Empty(c.Registry.RequestedSaIds);
    }

    [Fact]
    public async Task CreateLivenessSessionAsync_TrimsSurroundingWhitespaceFromTheSaId()
    {
        var userId = Guid.NewGuid();
        var c = SetupReadyForLiveness(userId, out var verification);

        await c.Service.CreateLivenessSessionAsync(
            verification.Id, userId, $"  {ValidSaId}  ", TestContext.Current.CancellationToken);

        Assert.Equal(ValidSaId, Assert.Single(c.Registry.RequestedSaIds));
    }

    [Fact]
    public async Task CreateLivenessSessionAsync_WithoutConsent_ThrowsInvalidVerificationState()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(userId, IdentityVerificationStatus.AwaitingDocument);
        c.Repo.VerificationById = verification;

        var ex = await Assert.ThrowsAsync<InvalidVerificationState>(
            () => c.Service.CreateLivenessSessionAsync(verification.Id, userId, ValidSaId, TestContext.Current.CancellationToken));

        Assert.Contains("Consent must be granted", ex.Message);
    }

    [Fact]
    public async Task CreateLivenessSessionAsync_FromAwaitingConsent_ThrowsInvalidVerificationState()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(userId, IdentityVerificationStatus.AwaitingConsent, consentGranted: true);
        c.Repo.VerificationById = verification;

        var ex = await Assert.ThrowsAsync<InvalidVerificationState>(
            () => c.Service.CreateLivenessSessionAsync(verification.Id, userId, ValidSaId, TestContext.Current.CancellationToken));

        Assert.Contains("cannot be created from the current verification state", ex.Message);
    }

    [Fact]
    public async Task CreateLivenessSessionAsync_FromAwaitingLiveness_IsAllowedForRetry()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(
            userId, IdentityVerificationStatus.AwaitingLiveness, consentGranted: true, submittedSaId: ValidSaId);
        c.Repo.VerificationById = verification;
        c.Registry.CitizenToReturn = RegistryCitizen();

        var result = await c.Service.CreateLivenessSessionAsync(
            verification.Id, userId, ValidSaId, TestContext.Current.CancellationToken);

        Assert.Equal(AzureSessionId, result.SessionId);
    }

    [Fact]
    public async Task CreateLivenessSessionAsync_WithADifferentSaIdThanAlreadySubmitted_ThrowsInvalidVerificationState()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(
            userId, IdentityVerificationStatus.AwaitingLiveness, consentGranted: true, submittedSaId: OtherSaId);
        c.Repo.VerificationById = verification;

        var ex = await Assert.ThrowsAsync<InvalidVerificationState>(
            () => c.Service.CreateLivenessSessionAsync(verification.Id, userId, ValidSaId, TestContext.Current.CancellationToken));

        Assert.Contains("already associated with a different", ex.Message);
        Assert.Empty(c.Registry.RequestedSaIds);
    }

    [Fact]
    public async Task CreateLivenessSessionAsync_WhenRegistryHasNoSuchIdentity_FailsTheSessionAndThrows()
    {
        var userId = Guid.NewGuid();
        var c = SetupReadyForLiveness(userId, out var verification);
        c.Registry.CitizenToReturn = null;

        var ex = await Assert.ThrowsAsync<InvalidVerificationState>(
            () => c.Service.CreateLivenessSessionAsync(verification.Id, userId, ValidSaId, TestContext.Current.CancellationToken));

        Assert.Contains("could not be verified against the Government Registry", ex.Message);
        Assert.Equal(IdentityVerificationStatus.Failed, verification.Status);
        Assert.False(verification.RegistryIdentityMatched);
        Assert.Equal(1, c.Repo.Saves);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task CreateLivenessSessionAsync_WhenRegistryPortraitIsMissing_FailsTheSessionAndThrows(string? blobName)
    {
        var userId = Guid.NewGuid();
        var c = SetupReadyForLiveness(userId, out var verification);
        c.Registry.CitizenToReturn = RegistryCitizen(photoBlobName: blobName);

        var ex = await Assert.ThrowsAsync<InvalidVerificationState>(
            () => c.Service.CreateLivenessSessionAsync(verification.Id, userId, ValidSaId, TestContext.Current.CancellationToken));

        Assert.Contains("portrait is unavailable", ex.Message);
        Assert.Equal(IdentityVerificationStatus.Failed, verification.Status);
        Assert.True(verification.RegistryIdentityMatched);
        Assert.Empty(c.Photos.OpenedBlobs);
    }

    [Fact]
    public async Task CreateLivenessSessionAsync_WhenPortraitCannotBeRead_FailsTheSessionAndThrows()
    {
        var userId = Guid.NewGuid();
        var c = SetupReadyForLiveness(userId, out var verification);
        c.Photos.ReturnNullStream = true;

        var ex = await Assert.ThrowsAsync<InvalidVerificationState>(
            () => c.Service.CreateLivenessSessionAsync(verification.Id, userId, ValidSaId, TestContext.Current.CancellationToken));

        Assert.Contains("could not be retrieved", ex.Message);
        Assert.Equal(IdentityVerificationStatus.Failed, verification.Status);
        Assert.Equal(0, c.Face.CreateCalls);
    }

    [Fact]
    public async Task CreateLivenessSessionAsync_OnSuccess_StoresTheAzureSessionAndAwaitsLiveness()
    {
        var userId = Guid.NewGuid();
        var c = SetupReadyForLiveness(userId, out var verification);

        var result = await c.Service.CreateLivenessSessionAsync(
            verification.Id, userId, ValidSaId, TestContext.Current.CancellationToken);

        Assert.Equal(AzureSessionId, result.SessionId);
        Assert.Equal(AzureSessionId, verification.AzureLivenessSessionId);
        Assert.Equal(IdentityVerificationStatus.AwaitingLiveness, verification.Status);
        Assert.True(verification.RegistryIdentityMatched);
        Assert.Equal(ValidSaId, verification.SubmittedSaId);
        Assert.Equal("portrait.jpg", Assert.Single(c.Photos.OpenedBlobs));
    }

    [Theory]
    [InlineData("portrait.jpg", "image/jpeg")]
    [InlineData("portrait.JPEG", "image/jpeg")]
    [InlineData("portrait.png", "image/png")]
    [InlineData("portrait.PNG", "image/png")]
    [InlineData("portrait.bmp", "application/octet-stream")]
    [InlineData("portrait", "application/octet-stream")]
    public async Task CreateLivenessSessionAsync_DerivesContentTypeFromThePortraitExtension(
        string blobName,
        string expectedContentType)
    {
        var userId = Guid.NewGuid();
        var c = SetupReadyForLiveness(userId, out var verification);
        c.Registry.CitizenToReturn = RegistryCitizen(photoBlobName: blobName);

        await c.Service.CreateLivenessSessionAsync(verification.Id, userId, ValidSaId, TestContext.Current.CancellationToken);

        Assert.Equal(expectedContentType, c.Face.LastContentType);
    }

    [Fact]
    public async Task CompleteLivenessAsync_WhenLivenessWasNeverStarted_ThrowsInvalidVerificationState()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(userId, IdentityVerificationStatus.AwaitingLiveness, consentGranted: true);
        c.Repo.VerificationById = verification;

        var ex = await Assert.ThrowsAsync<InvalidVerificationState>(
            () => c.Service.CompleteLivenessAsync(verification.Id, userId, TestContext.Current.CancellationToken));

        Assert.Contains("has not been started", ex.Message);
    }

    [Fact]
    public async Task CompleteLivenessAsync_WhileAzureIsStillProcessing_ReturnsCurrentStateUnchanged()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(
            userId, IdentityVerificationStatus.AwaitingLiveness, consentGranted: true, azureSessionId: AzureSessionId);
        c.Repo.VerificationById = verification;
        c.Face.ResultToReturn = new LivenessVerificationResult { Status = "Running", IsComplete = false };

        var result = await c.Service.CompleteLivenessAsync(verification.Id, userId, TestContext.Current.CancellationToken);

        Assert.Equal(IdentityVerificationStatus.AwaitingLiveness, result.Status);
        Assert.Null(verification.LivenessPassed);
        Assert.Equal(0, c.Repo.Saves);
        Assert.Equal(AzureSessionId, c.Face.LastSessionId);
    }

    [Theory]
    [InlineData(null, true, true, "Government Registry identity verification failed.")]
    [InlineData(false, true, true, "Government Registry identity verification failed.")]
    [InlineData(true, false, true, "Liveness verification failed.")]
    [InlineData(true, null, true, "A liveness verification result could not be obtained.")]
    [InlineData(true, true, false, "Live face did not match the Government Registry portrait.")]
    [InlineData(true, true, null, "A face verification result could not be obtained.")]
    public async Task CompleteLivenessAsync_WhenAnyCheckFails_RecordsTheMatchingFailureReason(
        bool? registryIdentityMatched,
        bool? livenessPassed,
        bool? faceMatched,
        string expectedReason)
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(
            userId,
            IdentityVerificationStatus.AwaitingLiveness,
            consentGranted: true,
            submittedSaId: ValidSaId,
            azureSessionId: AzureSessionId,
            registryIdentityMatched: registryIdentityMatched);
        c.Repo.VerificationById = verification;
        c.Face.ResultToReturn = new LivenessVerificationResult
        {
            Status = "Succeeded",
            IsComplete = true,
            LivenessPassed = livenessPassed,
            FaceMatched = faceMatched,
        };

        var result = await c.Service.CompleteLivenessAsync(verification.Id, userId, TestContext.Current.CancellationToken);

        Assert.Equal(IdentityVerificationStatus.Failed, result.Status);
        Assert.Equal(expectedReason, verification.FailureReason);
        Assert.Empty(c.Repo.AddedCitizens);
    }

    [Fact]
    public async Task CompleteLivenessAsync_WhenNoIdentityWasSubmitted_ThrowsInvalidVerificationState()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(
            userId,
            IdentityVerificationStatus.AwaitingLiveness,
            consentGranted: true,
            azureSessionId: AzureSessionId,
            registryIdentityMatched: true);
        c.Repo.VerificationById = verification;

        var ex = await Assert.ThrowsAsync<InvalidVerificationState>(
            () => c.Service.CompleteLivenessAsync(verification.Id, userId, TestContext.Current.CancellationToken));

        Assert.Contains("No identity is associated", ex.Message);
    }

    [Fact]
    public async Task CompleteLivenessAsync_WhenRegistryIdentityDisappeared_ThrowsInvalidVerificationState()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(
            userId,
            IdentityVerificationStatus.AwaitingLiveness,
            consentGranted: true,
            submittedSaId: ValidSaId,
            azureSessionId: AzureSessionId,
            registryIdentityMatched: true);
        c.Repo.VerificationById = verification;
        c.Registry.CitizenToReturn = null;

        var ex = await Assert.ThrowsAsync<InvalidVerificationState>(
            () => c.Service.CompleteLivenessAsync(verification.Id, userId, TestContext.Current.CancellationToken));

        Assert.Contains("could not be found", ex.Message);
    }

    [Fact]
    public async Task CompleteLivenessAsync_WhenIdentityBelongsToAnotherAccount_FailsTheSessionAndThrows()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(
            userId,
            IdentityVerificationStatus.AwaitingLiveness,
            consentGranted: true,
            submittedSaId: ValidSaId,
            azureSessionId: AzureSessionId,
            registryIdentityMatched: true);
        c.Repo.VerificationById = verification;
        c.Registry.CitizenToReturn = RegistryCitizen();
        c.Repo.CitizenBySaId = ExistingCitizen(userId: Guid.NewGuid());

        var ex = await Assert.ThrowsAsync<InvalidVerificationState>(
            () => c.Service.CompleteLivenessAsync(verification.Id, userId, TestContext.Current.CancellationToken));

        Assert.Contains("already linked to another account", ex.Message);
        Assert.Equal(IdentityVerificationStatus.Failed, verification.Status);
    }

    [Fact]
    public async Task CompleteLivenessAsync_WhenAccountAlreadyHasADifferentIdentity_FailsTheSessionAndThrows()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(
            userId,
            IdentityVerificationStatus.AwaitingLiveness,
            consentGranted: true,
            submittedSaId: ValidSaId,
            azureSessionId: AzureSessionId,
            registryIdentityMatched: true);
        c.Repo.VerificationById = verification;
        c.Registry.CitizenToReturn = RegistryCitizen();
        c.Repo.CitizenBySaId = null;
        c.Repo.CitizenByUserId = ExistingCitizen(userId);

        var ex = await Assert.ThrowsAsync<InvalidVerificationState>(
            () => c.Service.CompleteLivenessAsync(verification.Id, userId, TestContext.Current.CancellationToken));

        Assert.Contains("already linked to another identity", ex.Message);
        Assert.Equal(IdentityVerificationStatus.Failed, verification.Status);
        Assert.Empty(c.Repo.AddedCitizens);
    }

    [Theory]
    [InlineData("Female", Gender.Female)]
    [InlineData("male", Gender.Male)]
    [InlineData("OTHER", Gender.Other)]
    [InlineData("unknown-value", Gender.Unspecified)]
    [InlineData(null, Gender.Unspecified)]
    public async Task CompleteLivenessAsync_WhenNoCitizenRecordExists_CreatesOneFromTheRegistry(
        string? registryGender,
        Gender expectedGender)
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(
            userId,
            IdentityVerificationStatus.AwaitingLiveness,
            consentGranted: true,
            submittedSaId: ValidSaId,
            azureSessionId: AzureSessionId,
            registryIdentityMatched: true);
        c.Repo.VerificationById = verification;
        c.Registry.CitizenToReturn = RegistryCitizen(gender: registryGender);

        var result = await c.Service.CompleteLivenessAsync(verification.Id, userId, TestContext.Current.CancellationToken);

        var created = Assert.Single(c.Repo.AddedCitizens);
        Assert.Equal(ValidSaId, created.SaId);
        Assert.Equal("Thandiwe", created.Names);
        Assert.Equal("Dlamini", created.Surname);
        Assert.Equal(expectedGender, created.Gender);
        Assert.Equal(userId, created.UserId);
        Assert.Equal(CitizenStatus.Verified, created.Status);
        Assert.Equal(IdentityVerificationStatus.Verified, result.Status);
    }

    [Fact]
    public async Task CompleteLivenessAsync_WhenAnUnclaimedCitizenRecordExists_LinksItInsteadOfCreatingOne()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(
            userId,
            IdentityVerificationStatus.AwaitingLiveness,
            consentGranted: true,
            submittedSaId: ValidSaId,
            azureSessionId: AzureSessionId,
            registryIdentityMatched: true);
        c.Repo.VerificationById = verification;
        c.Registry.CitizenToReturn = RegistryCitizen();

        var unclaimed = ExistingCitizen(userId: null);
        c.Repo.CitizenBySaId = unclaimed;

        await c.Service.CompleteLivenessAsync(verification.Id, userId, TestContext.Current.CancellationToken);

        Assert.Empty(c.Repo.AddedCitizens);
        Assert.Equal(userId, unclaimed.UserId);
        Assert.Equal(CitizenStatus.Verified, unclaimed.Status);
    }

    [Fact]
    public async Task CompleteLivenessAsync_OnSuccess_MarksVerifiedAndClearsAnyEarlierFailureReason()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(
            userId,
            IdentityVerificationStatus.AwaitingLiveness,
            consentGranted: true,
            submittedSaId: ValidSaId,
            azureSessionId: AzureSessionId,
            registryIdentityMatched: true);
        verification.FailureReason = "Liveness verification failed.";
        c.Repo.VerificationById = verification;
        c.Registry.CitizenToReturn = RegistryCitizen();
        var before = DateTime.UtcNow;

        var result = await c.Service.CompleteLivenessAsync(verification.Id, userId, TestContext.Current.CancellationToken);

        Assert.Equal(IdentityVerificationStatus.Verified, result.Status);
        Assert.Null(verification.FailureReason);
        Assert.NotNull(verification.VerifiedAt);
        Assert.InRange(verification.VerifiedAt!.Value, before, DateTime.UtcNow);
        Assert.True(result.LivenessPassed);
        Assert.True(result.RegistryFaceMatched);
    }

    [Fact]
    public async Task GetAsync_WhenSessionBelongsToAnotherUser_ThrowsVerificationNotFound()
    {
        var c = Setup();
        var verification = CreateVerification(Guid.NewGuid());
        c.Repo.VerificationById = verification;

        await Assert.ThrowsAsync<VerificationNotFoundException>(
            () => c.Service.GetAsync(verification.Id, Guid.NewGuid(), TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task GetAsync_WithALapsedSession_MarksItExpired()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(userId, IdentityVerificationStatus.AwaitingDocument, expiresInMinutes: -1);
        c.Repo.VerificationById = verification;

        var result = await c.Service.GetAsync(verification.Id, userId, TestContext.Current.CancellationToken);

        Assert.Equal(IdentityVerificationStatus.Expired, result.Status);
        Assert.Equal(1, c.Repo.Saves);
    }

    [Theory]
    [InlineData(IdentityVerificationStatus.Verified)]
    [InlineData(IdentityVerificationStatus.Failed)]
    public async Task GetAsync_WithALapsedButCompletedSession_KeepsTheTerminalStatus(
        IdentityVerificationStatus status)
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(userId, status, expiresInMinutes: -1);
        c.Repo.VerificationById = verification;

        var result = await c.Service.GetAsync(verification.Id, userId, TestContext.Current.CancellationToken);

        Assert.Equal(status, result.Status);
        Assert.Equal(0, c.Repo.Saves);
    }

    [Fact]
    public async Task GetAsync_WithALiveSession_ReturnsItUnchanged()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var verification = CreateVerification(userId, IdentityVerificationStatus.AwaitingDocument);
        c.Repo.VerificationById = verification;

        var result = await c.Service.GetAsync(verification.Id, userId, TestContext.Current.CancellationToken);

        Assert.Equal(IdentityVerificationStatus.AwaitingDocument, result.Status);
        Assert.Equal(verification.Id, result.VerificationId);
        Assert.Equal(0, c.Repo.Saves);
    }
}
