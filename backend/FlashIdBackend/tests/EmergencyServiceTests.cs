using System.Buffers.Binary;
using System.Security.Cryptography;
using System.Text;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Services;
using Application.Features.Emergency.DTOs;
using Application.Features.Emergency.Exceptions;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Providers;
using Microsoft.Extensions.Configuration;
using Moq;
using System.Text.Json;

namespace tests;

public class EmergencyServiceTests
{
    private static readonly byte[] Context = Encoding.ASCII.GetBytes("FIDEMG1");

    private readonly Mock<IEmergencyRepository> _repository = new();
    private readonly Mock<ICredentialRepository> _credentials = new();
    private readonly Mock<IInstitutionRepository> _audit = new();
    private readonly Mock<IPhotoStorageProvider> _photos = new();
    private static readonly ICredentialSigningProvider SigningProvider = TestSigningProvider();
    private readonly ISdJwtCredentialFactory _credentialFactory = new SdJwtCredentialFactory(SigningProvider, TimeProvider.System);
    private readonly Mock<IEmergencyNotificationQueue> _notifications = new();
    private readonly Mock<IFieldCryptoProvider> _crypto = new();

    private readonly Guid _responderUserId = Guid.NewGuid();
    private readonly byte[] _handle = Enumerable.Range(0, 16).Select(i => (byte)i).ToArray();

    private EmergencyService Service() => new(
        _repository.Object, _credentials.Object, _audit.Object,
        _photos.Object, _credentialFactory, SigningProvider, _notifications.Object, _crypto.Object);

    private static ICredentialSigningProvider TestSigningProvider()
    {
        using var issuerKey = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Signing:Credential:Kid"] = "test-issuer-key",
                ["Signing:Credential:PrivateKey"] = Convert.ToBase64String(issuerKey.ExportPkcs8PrivateKey()),
            })
            .Build();

        return new LocalEs256SigningProvider(config);
    }

    private static Official Responder(InstitutionType type = InstitutionType.Healthcare) => new()
    {
        Id = Guid.NewGuid(),
        OfficialId = "OFF0001",
        Names = "Naledi",
        Surname = "Khumalo",
        UserId = Guid.NewGuid(),
        InstitutionId = Guid.NewGuid(),
        Institution = new Institution
        {
            Id = Guid.NewGuid(),
            Name = "Chris Hani Baragwanath",
            Type = type,
            ApiKeyReference = Guid.NewGuid(),
            VerificationNumber = "VN-1",
            RegisteredById = Guid.NewGuid(),
        },
    };

    private string BuildCode(ECDsa signer, DateTimeOffset issuedAt)
    {
        var signed = new byte[Context.Length + 20];
        Context.CopyTo(signed, 0);
        _handle.CopyTo(signed, Context.Length);
        BinaryPrimitives.WriteUInt32BigEndian(
            signed.AsSpan(Context.Length + 16, 4), (uint)issuedAt.ToUnixTimeSeconds());

        var signature = signer.SignData(
            signed, HashAlgorithmName.SHA256, DSASignatureFormat.Rfc3279DerSequence);

        var ts = new byte[4];
        BinaryPrimitives.WriteUInt32BigEndian(ts, (uint)issuedAt.ToUnixTimeSeconds());

        return "https://flashid.co.za/e#1."
             + $"{EmergencyBase64Url.Encode(_handle)}.{EmergencyBase64Url.Encode(ts)}.{EmergencyBase64Url.Encode(signature)}";
    }

    private EmergencyProfile Profile(Guid citizenId) => new()
    {
        Id = Guid.NewGuid(),
        CitizenId = citizenId,
        IsEnabled = true,
        ConsentGivenAt = DateTime.UtcNow,
        OfflineFieldsJson = "[\"bloodType\"]",
        BloodTypeCipher = "cipher",
        MedicalLastUpdatedAt = DateTime.UtcNow,
        Citizen = new Citizen
        {
            Id = citizenId,
            Names = "Thandiwe",
            Surname = "Dlamini",
            DateOfBirth = new DateTime(1990, 4, 12),
        },
        Contacts = new List<EmergencyContact>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Sipho",
                Relationship = "Brother",
                Email = "sipho@example.com",
                Priority = 1,
            },
        },
    };

    private ResolveEmergencyRequestDto Request(string code) => new()
    {
        Code = code,
        Justification = "Unconscious patient",
        WasOffline = false,
    };

    private void ResponderIs(Official? official) =>
        _repository
            .Setup(r => r.GetResponderAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(official);

    [Fact]
    public async Task ResolveAsync_OfficialNotInHealthcareOrLawEnforcement_Throws()
    {
        ResponderIs(null);

        await Assert.ThrowsAsync<InvalidEmergencyCodeException>(() =>
            Service().ResolveAsync(Request("anything"), _responderUserId, "1.2.3.4", CancellationToken.None));

        _audit.Verify(a => a.AddAuditLogAsync(It.Is<AuditLog>(
            l => l.EventType == AuditEventType.EmergencyProfileAccessFailed)), Times.Once);
    }

    [Fact]
    public async Task ResolveAsync_MalformedCode_ThrowsAndNeverLooksUpADevice()
    {
        ResponderIs(Responder());

        await Assert.ThrowsAsync<InvalidEmergencyCodeException>(() =>
            Service().ResolveAsync(Request("not-a-code"), _responderUserId, "1.2.3.4", CancellationToken.None));

        _repository.Verify(r => r.GetActiveDeviceByHandleAsync(
            It.IsAny<byte[]>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ResolveAsync_ExpiredCode_Throws()
    {
        ResponderIs(Responder());
        using var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var stale = BuildCode(key, DateTimeOffset.UtcNow.AddMinutes(-10));

        await Assert.ThrowsAsync<InvalidEmergencyCodeException>(() =>
            Service().ResolveAsync(Request(stale), _responderUserId, "1.2.3.4", CancellationToken.None));
    }

    [Fact]
    public async Task ResolveAsync_UnknownHandle_Throws()
    {
        ResponderIs(Responder());
        using var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        _repository
            .Setup(r => r.GetActiveDeviceByHandleAsync(It.IsAny<byte[]>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((EmergencyDevice?)null);

        await Assert.ThrowsAsync<InvalidEmergencyCodeException>(() =>
            Service().ResolveAsync(
                Request(BuildCode(key, DateTimeOffset.UtcNow)), _responderUserId, "1.2.3.4", CancellationToken.None));
    }

    [Fact]
    public async Task ResolveAsync_SignatureFromAnotherKey_ThrowsAndNeverBurnsTheCode()
    {
        ResponderIs(Responder());
        using var signer = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        using var other = ECDsa.Create(ECCurve.NamedCurves.nistP256);

        _repository
            .Setup(r => r.GetActiveDeviceByHandleAsync(It.IsAny<byte[]>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new EmergencyDevice
            {
                Id = Guid.NewGuid(),
                CitizenId = Guid.NewGuid(),
                Handle = _handle,
                PublicKeySpki = other.ExportSubjectPublicKeyInfo(),
                Platform = "android",
            });

        await Assert.ThrowsAsync<InvalidEmergencyCodeException>(() =>
            Service().ResolveAsync(
                Request(BuildCode(signer, DateTimeOffset.UtcNow)), _responderUserId, "1.2.3.4", CancellationToken.None));

        _repository.Verify(r => r.TryClaimCodeAsync(
            It.IsAny<byte[]>(), It.IsAny<DateTimeOffset>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ResolveAsync_ReplayedCode_Throws()
    {
        ResponderIs(Responder());
        using var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);

        _repository
            .Setup(r => r.GetActiveDeviceByHandleAsync(It.IsAny<byte[]>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new EmergencyDevice
            {
                Id = Guid.NewGuid(),
                CitizenId = Guid.NewGuid(),
                Handle = _handle,
                PublicKeySpki = key.ExportSubjectPublicKeyInfo(),
                Platform = "android",
            });
        _repository
            .Setup(r => r.TryClaimCodeAsync(
                It.IsAny<byte[]>(), It.IsAny<DateTimeOffset>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        await Assert.ThrowsAsync<InvalidEmergencyCodeException>(() =>
            Service().ResolveAsync(
                Request(BuildCode(key, DateTimeOffset.UtcNow)), _responderUserId, "1.2.3.4", CancellationToken.None));
    }

    [Fact]
    public async Task ResolveAsync_ValidCode_ReturnsProfileAndRecordsAccess()
    {
        var citizenId = Guid.NewGuid();
        var responder = Responder();
        ResponderIs(responder);

        using var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);

        _repository
            .Setup(r => r.GetActiveDeviceByHandleAsync(It.IsAny<byte[]>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new EmergencyDevice
            {
                Id = Guid.NewGuid(),
                CitizenId = citizenId,
                Handle = _handle,
                PublicKeySpki = key.ExportSubjectPublicKeyInfo(),
                Platform = "android",
            });
        _repository
            .Setup(r => r.TryClaimCodeAsync(
                It.IsAny<byte[]>(), It.IsAny<DateTimeOffset>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _repository
            .Setup(r => r.GetEnabledProfileWithContactsAsync(citizenId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Profile(citizenId));
        _credentials
            .Setup(c => c.GetCredentialsByCitizenIdAsync(citizenId))
            .ReturnsAsync(new List<Credential>());
        _crypto.Setup(c => c.Decrypt(It.IsAny<string>(), It.IsAny<string>())).Returns("O negative");

        var result = await Service().ResolveAsync(
            Request(BuildCode(key, DateTimeOffset.UtcNow)), _responderUserId, "1.2.3.4", CancellationToken.None);

        Assert.Equal("Thandiwe", result.Identity.Names);
        Assert.Null(result.Identity.PhotoUrl);
        Assert.Contains(result.Medical, m => m.Value == "O negative");
        Assert.Single(result.Contacts);

        _repository.Verify(r => r.AddAccessAsync(
            It.Is<EmergencyAccess>(a =>
                a.ResponderName == "Naledi Khumalo" &&
                a.Justification == "Unconscious patient" &&
                a.IpAddress == "1.2.3.4"),
            It.IsAny<CancellationToken>()), Times.Once);

        _audit.Verify(a => a.AddAuditLogAsync(It.Is<AuditLog>(
            l => l.EventType == AuditEventType.EmergencyProfileAccessed)), Times.Once);

        _notifications.Verify(n => n.Enqueue(It.IsAny<Guid>()), Times.Once);
    }

    [Fact]
    public async Task ResolveAsync_ProfileDisabled_ThrowsNotFound()
    {
        ResponderIs(Responder());
        using var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);

        _repository
            .Setup(r => r.GetActiveDeviceByHandleAsync(It.IsAny<byte[]>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new EmergencyDevice
            {
                Id = Guid.NewGuid(),
                CitizenId = Guid.NewGuid(),
                Handle = _handle,
                PublicKeySpki = key.ExportSubjectPublicKeyInfo(),
                Platform = "android",
            });
        _repository
            .Setup(r => r.TryClaimCodeAsync(
                It.IsAny<byte[]>(), It.IsAny<DateTimeOffset>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _repository
            .Setup(r => r.GetEnabledProfileWithContactsAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((EmergencyProfile?)null);

        await Assert.ThrowsAsync<EmergencyProfileNotFoundException>(() =>
            Service().ResolveAsync(
                Request(BuildCode(key, DateTimeOffset.UtcNow)), _responderUserId, "1.2.3.4", CancellationToken.None));
    }

    [Fact]
    public async Task RegisterDeviceAsync_NoCitizen_Throws()
    {
        _credentials
            .Setup(c => c.GetCitizenByUserIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Citizen?)null);

        await Assert.ThrowsAsync<EmergencyProfileNotFoundException>(() =>
            Service().RegisterDeviceAsync(
                new RegisterEmergencyDeviceRequestDto { PublicKeySpki = "AAAA" },
                Guid.NewGuid(), CancellationToken.None));
    }

    [Fact]
    public async Task RegisterDeviceAsync_MalformedPublicKey_Throws()
    {
        var citizen = new Citizen { Id = Guid.NewGuid(), Names = "T", Surname = "D" };
        _credentials.Setup(c => c.GetCitizenByUserIdAsync(It.IsAny<Guid>())).ReturnsAsync(citizen);

        await Assert.ThrowsAsync<InvalidEmergencyCodeException>(() =>
            Service().RegisterDeviceAsync(
                new RegisterEmergencyDeviceRequestDto { PublicKeySpki = EmergencyBase64Url.Encode(new byte[] { 1, 2, 3 }) },
                Guid.NewGuid(), CancellationToken.None));
    }

    [Fact]
    public async Task RegisterDeviceAsync_ValidKey_ReturnsHandleAndRevokesPreviousDevice()
    {
        var citizen = new Citizen { Id = Guid.NewGuid(), Names = "T", Surname = "D" };
        var existing = new EmergencyDevice
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Handle = _handle,
            PublicKeySpki = new byte[] { 1 },
            Platform = "android",
        };

        _credentials.Setup(c => c.GetCitizenByUserIdAsync(It.IsAny<Guid>())).ReturnsAsync(citizen);
        _repository
            .Setup(r => r.GetActiveDeviceByCitizenIdAsync(citizen.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        using var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);

        var result = await Service().RegisterDeviceAsync(
            new RegisterEmergencyDeviceRequestDto
            {
                PublicKeySpki = EmergencyBase64Url.Encode(key.ExportSubjectPublicKeyInfo()),
                Platform = "android",
                DeviceLabel = "Pixel 8",
                IsStrongBoxBacked = true,
            },
            Guid.NewGuid(), CancellationToken.None);

        Assert.Equal(16, EmergencyBase64Url.Decode(result.Handle).Length);
        Assert.NotNull(existing.RevokedAt);
        _repository.Verify(r => r.AddDeviceAsync(
            It.IsAny<EmergencyDevice>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetMyProfileAsync_NoProfile_ReturnsEmptyDtoNotNull()
    {
        _repository
            .Setup(r => r.GetProfileByUserIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((EmergencyProfile?)null);

        var result = await Service().GetMyProfileAsync(Guid.NewGuid(), CancellationToken.None);

        Assert.NotNull(result);
        Assert.False(result.IsEnabled);
    }

    [Fact]
    public async Task SaveProfileAsync_EnabledWithoutConsent_Throws()
    {
        await Assert.ThrowsAsync<EmergencyConsentRequiredException>(() =>
            Service().SaveProfileAsync(
                new SaveEmergencyProfileRequestDto { IsEnabled = true, ConsentGiven = false },
                Guid.NewGuid(), CancellationToken.None));
    }

    [Fact]
    public async Task BuildOfflineCredentialAsync_NoProfile_Throws()
    {
        _repository
            .Setup(r => r.GetProfileByUserIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((EmergencyProfile?)null);

        await Assert.ThrowsAsync<EmergencyProfileNotFoundException>(() =>
            Service().BuildOfflineCredentialAsync(Guid.NewGuid(), CancellationToken.None));
    }

    [Fact]
    public async Task BuildOfflineCredentialAsync_NoRegisteredDevice_Throws()
    {
        var citizenId = Guid.NewGuid();
        _repository
            .Setup(r => r.GetProfileByUserIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Profile(citizenId));
        _repository
            .Setup(r => r.GetActiveDeviceByCitizenIdAsync(citizenId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((EmergencyDevice?)null);

        await Assert.ThrowsAsync<EmergencyDeviceNotRegisteredException>(() =>
            Service().BuildOfflineCredentialAsync(Guid.NewGuid(), CancellationToken.None));
    }

    private EmergencyDevice RegisteredDevice(Guid citizenId, ECDsa deviceKey) => new()
    {
        Id = Guid.NewGuid(),
        CitizenId = citizenId,
        Handle = _handle,
        PublicKeySpki = deviceKey.ExportSubjectPublicKeyInfo(),
        Platform = "android",
    };

    private void OfflineMintSetup(EmergencyProfile profile, ECDsa deviceKey)
    {
        _repository
            .Setup(r => r.GetProfileByUserIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(profile);
        _repository
            .Setup(r => r.GetActiveDeviceByCitizenIdAsync(profile.CitizenId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(RegisteredDevice(profile.CitizenId, deviceKey));
        _repository
            .Setup(r => r.NextRevocationIndexAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(EmergencyClaimNames.RevocationIndexOffset);
        _repository
            .Setup(r => r.TrySaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _crypto.Setup(c => c.Decrypt(It.IsAny<string>(), It.IsAny<string>())).Returns("O negative");
    }

    private static JsonElement IssuerPayload(string sdJwt)
    {
        var issuerJwt = sdJwt.Split('~')[0];
        var payload = System.Buffers.Text.Base64Url.DecodeFromChars(issuerJwt.Split('.')[1]);
        return JsonDocument.Parse(payload).RootElement;
    }

    private static Dictionary<string, string> Disclosed(string sdJwt) =>
        sdJwt.Split('~')
            .Skip(1)
            .Where(part => part.Length > 0)
            .Select(part => JsonDocument.Parse(System.Buffers.Text.Base64Url.DecodeFromChars(part)).RootElement)
            .ToDictionary(d => d[1].GetString()!, d => d[2].GetString()!);

    [Fact]
    public async Task BuildOfflineCredentialAsync_IssuesAnEmergencySdJwtBoundToThePhone()
    {
        using var deviceKey = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var profile = Profile(Guid.NewGuid());
        profile.OfflineFieldsJson = "[\"bloodType\",\"name\"]";
        OfflineMintSetup(profile, deviceKey);

        var result = await Service().BuildOfflineCredentialAsync(Guid.NewGuid(), CancellationToken.None);

        var payload = IssuerPayload(result.SdJwt);
        Assert.Equal(EmergencyClaimNames.Vct, payload.GetProperty("vct").GetString());
        Assert.Equal(EmergencyClaimNames.RevocationIndexOffset, payload.GetProperty("ri").GetInt32());

        var point = deviceKey.ExportParameters(false).Q;
        var jwk = payload.GetProperty("cnf").GetProperty("jwk");
        Assert.Equal(System.Buffers.Text.Base64Url.EncodeToString(point.X!), jwk.GetProperty("x").GetString());
        Assert.Equal(System.Buffers.Text.Base64Url.EncodeToString(point.Y!), jwk.GetProperty("y").GetString());

        var disclosed = Disclosed(result.SdJwt);
        Assert.Equal("O negative", disclosed[EmergencyClaimNames.BloodType]);
        Assert.Equal("Thandiwe Dlamini", disclosed[EmergencyClaimNames.FullName]);
        Assert.True(disclosed.ContainsKey(EmergencyClaimNames.MedicalUpdatedOn));
    }

    [Fact]
    public async Task BuildOfflineCredentialAsync_ReleasedContacts_AreIncludedInPriorityOrderWithoutEmail()
    {
        using var deviceKey = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var profile = Profile(Guid.NewGuid());
        profile.OfflineFieldsJson = "[\"contacts\"]";
        profile.Contacts.First().Phone = "0821234567";
        profile.Contacts.Add(new EmergencyContact { Id = Guid.NewGuid(), Name = "Lerato", Relationship = "Mother", Priority = 0 });
        OfflineMintSetup(profile, deviceKey);

        var result = await Service().BuildOfflineCredentialAsync(Guid.NewGuid(), CancellationToken.None);

        var disclosed = Disclosed(result.SdJwt);
        Assert.Equal("Lerato", disclosed["contact_1_name"]);
        Assert.Equal("Mother", disclosed["contact_1_relationship"]);
        Assert.False(disclosed.ContainsKey("contact_1_phone"));
        Assert.Equal("Sipho", disclosed["contact_2_name"]);
        Assert.Equal("Brother", disclosed["contact_2_relationship"]);
        Assert.Equal("0821234567", disclosed["contact_2_phone"]);
        Assert.DoesNotContain(disclosed.Values, value => value.Contains('@'));
    }

    [Fact]
    public async Task BuildOfflineCredentialAsync_ContactsNotReleased_AreLeftOut()
    {
        using var deviceKey = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var profile = Profile(Guid.NewGuid());
        OfflineMintSetup(profile, deviceKey);

        var result = await Service().BuildOfflineCredentialAsync(Guid.NewGuid(), CancellationToken.None);

        Assert.DoesNotContain(Disclosed(result.SdJwt).Keys, key => key.StartsWith("contact_", StringComparison.Ordinal));
    }

    [Fact]
    public async Task BuildOfflineCredentialAsync_LeavesOutFieldsTheCitizenDidNotRelease()
    {
        using var deviceKey = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var profile = Profile(Guid.NewGuid());
        profile.AllergiesCipher = "cipher";
        profile.OfflineFieldsJson = "[]";
        OfflineMintSetup(profile, deviceKey);

        var result = await Service().BuildOfflineCredentialAsync(Guid.NewGuid(), CancellationToken.None);

        Assert.Equal([EmergencyClaimNames.MedicalUpdatedOn], Disclosed(result.SdJwt).Keys);
    }

    [Fact]
    public async Task BuildOfflineCredentialAsync_ExpiresWithinTheThirtyDayCap()
    {
        using var deviceKey = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        OfflineMintSetup(Profile(Guid.NewGuid()), deviceKey);

        var result = await Service().BuildOfflineCredentialAsync(Guid.NewGuid(), CancellationToken.None);

        Assert.True(result.ExpiresAt <= DateTime.UtcNow.AddDays(30).AddMinutes(1));
    }

    [Fact]
    public async Task BuildOfflineCredentialAsync_ExistingIndex_IsReusedWithoutSaving()
    {
        using var deviceKey = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var profile = Profile(Guid.NewGuid());
        profile.RevocationIndex = EmergencyClaimNames.RevocationIndexOffset + 7;
        OfflineMintSetup(profile, deviceKey);

        var result = await Service().BuildOfflineCredentialAsync(Guid.NewGuid(), CancellationToken.None);

        Assert.Equal(EmergencyClaimNames.RevocationIndexOffset + 7, IssuerPayload(result.SdJwt).GetProperty("ri").GetInt32());
        _repository.Verify(r => r.NextRevocationIndexAsync(It.IsAny<CancellationToken>()), Times.Never);
        _repository.Verify(r => r.TrySaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task BuildOfflineCredentialAsync_IndexTakenByAConcurrentMint_AllocatesAgain()
    {
        using var deviceKey = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var profile = Profile(Guid.NewGuid());
        OfflineMintSetup(profile, deviceKey);
        _repository
            .SetupSequence(r => r.NextRevocationIndexAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(EmergencyClaimNames.RevocationIndexOffset)
            .ReturnsAsync(EmergencyClaimNames.RevocationIndexOffset + 1);
        _repository
            .SetupSequence(r => r.TrySaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(false)
            .ReturnsAsync(true);

        var result = await Service().BuildOfflineCredentialAsync(Guid.NewGuid(), CancellationToken.None);

        Assert.Equal(EmergencyClaimNames.RevocationIndexOffset + 1, IssuerPayload(result.SdJwt).GetProperty("ri").GetInt32());
        Assert.Equal(EmergencyClaimNames.RevocationIndexOffset + 1, profile.RevocationIndex);
    }

    [Fact]
    public async Task BuildOfflineCredentialAsync_EveryAttemptCollides_Throws()
    {
        using var deviceKey = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        OfflineMintSetup(Profile(Guid.NewGuid()), deviceKey);
        _repository
            .Setup(r => r.TrySaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            Service().BuildOfflineCredentialAsync(Guid.NewGuid(), CancellationToken.None));
    }

    [Fact]
    public async Task RegisterDeviceAsync_NewPhone_RetiresTheOldPhonesIndex()
    {
        var citizen = new Citizen { Id = Guid.NewGuid(), Names = "T", Surname = "D" };
        var profile = Profile(citizen.Id);
        profile.RevocationIndex = EmergencyClaimNames.RevocationIndexOffset + 3;

        _credentials.Setup(c => c.GetCitizenByUserIdAsync(It.IsAny<Guid>())).ReturnsAsync(citizen);
        _repository
            .Setup(r => r.GetProfileByUserIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(profile);

        using var newPhone = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        await Service().RegisterDeviceAsync(
            new RegisterEmergencyDeviceRequestDto
            {
                PublicKeySpki = EmergencyBase64Url.Encode(newPhone.ExportSubjectPublicKeyInfo()),
                Platform = "android",
            },
            Guid.NewGuid(), CancellationToken.None);

        _repository.Verify(r => r.AddRetiredRevocationIndexAsync(
            It.Is<RetiredEmergencyRevocationIndex>(x =>
                x.RevocationIndex == EmergencyClaimNames.RevocationIndexOffset + 3 &&
                x.EmergencyProfileId == profile.Id),
            It.IsAny<CancellationToken>()), Times.Once);
        Assert.Null(profile.RevocationIndex);
    }

    [Fact]
    public async Task RegisterDeviceAsync_NonP256Key_Throws()
    {
        var citizen = new Citizen { Id = Guid.NewGuid(), Names = "T", Surname = "D" };
        _credentials.Setup(c => c.GetCitizenByUserIdAsync(It.IsAny<Guid>())).ReturnsAsync(citizen);

        using var p384 = ECDsa.Create(ECCurve.NamedCurves.nistP384);

        await Assert.ThrowsAsync<InvalidEmergencyCodeException>(() =>
            Service().RegisterDeviceAsync(
                new RegisterEmergencyDeviceRequestDto
                {
                    PublicKeySpki = EmergencyBase64Url.Encode(p384.ExportSubjectPublicKeyInfo()),
                },
                Guid.NewGuid(), CancellationToken.None));
    }

    [Fact]
    public async Task SaveProfileAsync_Disabling_RetiresTheIndexSoReEnablingCannotRevive()
    {
        var profile = Profile(Guid.NewGuid());
        profile.RevocationIndex = EmergencyClaimNames.RevocationIndexOffset + 9;
        _repository
            .Setup(r => r.GetProfileByUserIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(profile);

        await Service().SaveProfileAsync(
            new SaveEmergencyProfileRequestDto { IsEnabled = false, ConsentGiven = false },
            Guid.NewGuid(), CancellationToken.None);

        _repository.Verify(r => r.AddRetiredRevocationIndexAsync(
            It.Is<RetiredEmergencyRevocationIndex>(x => x.RevocationIndex == EmergencyClaimNames.RevocationIndexOffset + 9),
            It.IsAny<CancellationToken>()), Times.Once);
        Assert.Null(profile.RevocationIndex);
    }

    private readonly ECDsa _phoneKey = ECDsa.Create(ECCurve.NamedCurves.nistP256);
    private readonly DateTimeOffset _scannedAt = DateTimeOffset.UtcNow.AddMinutes(-30);
    private string _presentation = string.Empty;
    private int _scannedIndex = EmergencyClaimNames.RevocationIndexOffset + 1;

    private RecordOfflineEmergencyAccessRequestDto OfflineAccess(Guid? id = null, string justification = "Unconscious at roadside") => new()
    {
        Id = id ?? Guid.NewGuid(),
        RevocationIndex = _scannedIndex,
        Justification = justification,
        AccessedAt = _scannedAt.AddMinutes(2).ToUnixTimeSeconds(),
        Presentation = _presentation,
    };

    private static string KeyBindingJwt(string sdJwt, ECDsa key, DateTimeOffset issuedAt)
    {
        static string B64(byte[] bytes) => System.Buffers.Text.Base64Url.EncodeToString(bytes);

        var sdHash = B64(SHA256.HashData(Encoding.ASCII.GetBytes(sdJwt)));
        var header = B64(Encoding.UTF8.GetBytes("{\"alg\":\"ES256\",\"typ\":\"kb+jwt\"}"));
        var payload = B64(Encoding.UTF8.GetBytes($"{{\"iat\":{issuedAt.ToUnixTimeSeconds()},\"sd_hash\":\"{sdHash}\"}}"));
        var signature = key.SignData(Encoding.ASCII.GetBytes($"{header}.{payload}"), HashAlgorithmName.SHA256);
        return $"{header}.{payload}.{B64(signature)}";
    }

    private async Task OfflineAccessSetupAsync(EmergencyProfile profile, Official? official, ECDsa? scannedPhone = null)
    {
        OfflineMintSetup(profile, _phoneKey);
        var credential = await Service().BuildOfflineCredentialAsync(Guid.NewGuid(), CancellationToken.None);
        _scannedIndex = profile.RevocationIndex!.Value;
        _presentation = credential.SdJwt + KeyBindingJwt(credential.SdJwt, scannedPhone ?? _phoneKey, _scannedAt);

        _repository
            .Setup(r => r.GetProfileByRevocationIndexAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(profile);
        _repository
            .Setup(r => r.GetOfficialAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(official);
        _repository
            .Setup(r => r.TrySaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
    }

    private void NothingRecorded()
    {
        _repository.Verify(r => r.AddAccessAsync(It.IsAny<EmergencyAccess>(), It.IsAny<CancellationToken>()), Times.Never);
        _notifications.Verify(n => n.Enqueue(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task RecordOfflineAccessAsync_ScannedCode_RecordsTheAccessAndQueuesTheNotification()
    {
        var profile = Profile(Guid.NewGuid());
        await OfflineAccessSetupAsync(profile, Responder());
        var request = OfflineAccess();

        await Service().RecordOfflineAccessAsync(request, _responderUserId, "1.2.3.4", CancellationToken.None);

        _repository.Verify(r => r.AddAccessAsync(
            It.Is<EmergencyAccess>(a =>
                a.Id == request.Id &&
                a.EmergencyProfileId == profile.Id &&
                a.WasOffline &&
                a.Justification == "Unconscious at roadside" &&
                a.ResponderName == "Naledi Khumalo" &&
                a.AccessedAt == DateTimeOffset.FromUnixTimeSeconds(request.AccessedAt).UtcDateTime),
            It.IsAny<CancellationToken>()), Times.Once);
        _notifications.Verify(n => n.Enqueue(request.Id), Times.Once);
    }

    [Fact]
    public async Task RecordOfflineAccessAsync_RetriedUpload_IsNotRecordedTwice()
    {
        _repository
            .Setup(r => r.AccessExistsAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        await Service().RecordOfflineAccessAsync(OfflineAccess(), _responderUserId, "1.2.3.4", CancellationToken.None);

        NothingRecorded();
    }

    [Fact]
    public async Task RecordOfflineAccessAsync_SameScanUploadedUnderANewId_IsNotRecordedTwice()
    {
        await OfflineAccessSetupAsync(Profile(Guid.NewGuid()), Responder());
        _repository
            .Setup(r => r.OfflineAccessExistsAsync(
                It.IsAny<Guid>(), _responderUserId, It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        await Service().RecordOfflineAccessAsync(OfflineAccess(), _responderUserId, "1.2.3.4", CancellationToken.None);

        NothingRecorded();
    }

    [Fact]
    public async Task RecordOfflineAccessAsync_ConcurrentRetryStoredItFirst_DoesNotNotifyAgain()
    {
        await OfflineAccessSetupAsync(Profile(Guid.NewGuid()), Responder());
        _repository
            .Setup(r => r.TrySaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        await Service().RecordOfflineAccessAsync(OfflineAccess(), _responderUserId, "1.2.3.4", CancellationToken.None);

        _notifications.Verify(n => n.Enqueue(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task RecordOfflineAccessAsync_ProfileNoLongerExists_Throws()
    {
        await OfflineAccessSetupAsync(Profile(Guid.NewGuid()), Responder());
        _repository
            .Setup(r => r.GetProfileByRevocationIndexAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((EmergencyProfile?)null);

        await Assert.ThrowsAsync<EmergencyProfileNotFoundException>(() =>
            Service().RecordOfflineAccessAsync(OfflineAccess(), _responderUserId, "1.2.3.4", CancellationToken.None));
    }

    [Fact]
    public async Task RecordOfflineAccessAsync_WithoutAScannedCode_IsRejected()
    {
        await Assert.ThrowsAsync<ArgumentException>(() =>
            Service().RecordOfflineAccessAsync(OfflineAccess(), _responderUserId, "1.2.3.4", CancellationToken.None));

        NothingRecorded();
    }

    [Fact]
    public async Task RecordOfflineAccessAsync_TamperedCode_IsRejected()
    {
        await OfflineAccessSetupAsync(Profile(Guid.NewGuid()), Responder());
        var last = _presentation[^1] == 'A' ? 'B' : 'A';
        var request = OfflineAccess() with { Presentation = _presentation[..^1] + last };

        await Assert.ThrowsAsync<ArgumentException>(() =>
            Service().RecordOfflineAccessAsync(request, _responderUserId, "1.2.3.4", CancellationToken.None));

        NothingRecorded();
    }

    [Fact]
    public async Task RecordOfflineAccessAsync_GuessedIndexWithSomeoneElsesCode_IsRejected()
    {
        await OfflineAccessSetupAsync(Profile(Guid.NewGuid()), Responder());
        var request = OfflineAccess() with { RevocationIndex = _scannedIndex + 1 };

        await Assert.ThrowsAsync<ArgumentException>(() =>
            Service().RecordOfflineAccessAsync(request, _responderUserId, "1.2.3.4", CancellationToken.None));

        NothingRecorded();
    }

    [Fact]
    public async Task RecordOfflineAccessAsync_KeyBindingFromAnotherPhone_IsRejected()
    {
        using var otherPhone = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        await OfflineAccessSetupAsync(Profile(Guid.NewGuid()), Responder(), otherPhone);

        await Assert.ThrowsAsync<ArgumentException>(() =>
            Service().RecordOfflineAccessAsync(OfflineAccess(), _responderUserId, "1.2.3.4", CancellationToken.None));

        NothingRecorded();
    }

    [Fact]
    public async Task RecordOfflineAccessAsync_AccessTimeFarFromTheScan_IsRejected()
    {
        await OfflineAccessSetupAsync(Profile(Guid.NewGuid()), Responder());
        var request = OfflineAccess() with { AccessedAt = _scannedAt.AddHours(3).ToUnixTimeSeconds() };

        await Assert.ThrowsAsync<ArgumentException>(() =>
            Service().RecordOfflineAccessAsync(request, _responderUserId, "1.2.3.4", CancellationToken.None));

        NothingRecorded();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("too short")]
    public async Task RecordOfflineAccessAsync_WithoutAProperReason_Throws(string justification)
    {
        await Assert.ThrowsAsync<ArgumentException>(() =>
            Service().RecordOfflineAccessAsync(OfflineAccess(justification: justification), _responderUserId, "1.2.3.4", CancellationToken.None));
    }

    [Fact]
    public async Task RecordOfflineAccessAsync_ReasonLongerThanTheColumn_Throws()
    {
        await Assert.ThrowsAsync<ArgumentException>(() =>
            Service().RecordOfflineAccessAsync(OfflineAccess(justification: new string('a', 501)), _responderUserId, "1.2.3.4", CancellationToken.None));
    }

    [Fact]
    public async Task RecordOfflineAccessAsync_TimestampFarInTheFuture_Throws()
    {
        var request = OfflineAccess() with { AccessedAt = DateTimeOffset.UtcNow.AddDays(3).ToUnixTimeSeconds() };

        await Assert.ThrowsAsync<ArgumentException>(() =>
            Service().RecordOfflineAccessAsync(request, _responderUserId, "1.2.3.4", CancellationToken.None));
    }

    [Fact]
    public async Task RecordOfflineAccessAsync_OfficialOutsideHealthcareAndPolice_IsStillRecordedAndFlagged()
    {
        await OfflineAccessSetupAsync(Profile(Guid.NewGuid()), Responder(InstitutionType.HomeAffairs));

        await Service().RecordOfflineAccessAsync(OfflineAccess(), _responderUserId, "1.2.3.4", CancellationToken.None);

        _repository.Verify(r => r.AddAccessAsync(It.IsAny<EmergencyAccess>(), It.IsAny<CancellationToken>()), Times.Once);
        _audit.Verify(a => a.AddAuditLogAsync(It.Is<AuditLog>(l =>
            l.EventType == AuditEventType.EmergencyProfileAccessed &&
            l.Details!.Contains("outside healthcare and law enforcement"))), Times.Once);
    }

    [Fact]
    public async Task ResolveAsync_ReasonTooLong_IsRejectedBeforeTheCodeIsClaimed()
    {
        ResponderIs(Responder());
        using var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var request = Request(BuildCode(key, DateTimeOffset.UtcNow)) with { Justification = new string('a', 501) };

        await Assert.ThrowsAsync<ArgumentException>(() =>
            Service().ResolveAsync(request, _responderUserId, "1.2.3.4", CancellationToken.None));

        _repository.Verify(r => r.TryClaimCodeAsync(
            It.IsAny<byte[]>(), It.IsAny<DateTimeOffset>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task RegisterDeviceAsync_KeyThatIsNotBase64Url_ThrowsInvalidCode()
    {
        _credentials.Setup(c => c.GetCitizenByUserIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync(new Citizen { Id = Guid.NewGuid(), Names = "T", Surname = "D" });

        await Assert.ThrowsAsync<InvalidEmergencyCodeException>(() =>
            Service().RegisterDeviceAsync(
                new RegisterEmergencyDeviceRequestDto { PublicKeySpki = "not*base64" },
                Guid.NewGuid(), CancellationToken.None));
    }

    [Fact]
    public async Task RegisterDeviceAsync_Other256BitCurve_Throws()
    {
        ECDsa brainpool;
        try
        {
            brainpool = ECDsa.Create(ECCurve.NamedCurves.brainpoolP256r1);
        }
        catch (Exception ex) when (ex is PlatformNotSupportedException or CryptographicException)
        {
            Assert.Skip("This platform cannot create brainpoolP256r1 keys.");
            return;
        }

        using (brainpool)
        {
            _credentials.Setup(c => c.GetCitizenByUserIdAsync(It.IsAny<Guid>()))
                .ReturnsAsync(new Citizen { Id = Guid.NewGuid(), Names = "T", Surname = "D" });

            await Assert.ThrowsAsync<InvalidEmergencyCodeException>(() =>
                Service().RegisterDeviceAsync(
                    new RegisterEmergencyDeviceRequestDto
                    {
                        PublicKeySpki = EmergencyBase64Url.Encode(brainpool.ExportSubjectPublicKeyInfo()),
                    },
                    Guid.NewGuid(), CancellationToken.None));
        }
    }

    private EmergencyProfile SavedProfile()
    {
        var profile = Profile(Guid.NewGuid());
        profile.RevocationIndex = EmergencyClaimNames.RevocationIndexOffset + 11;
        profile.BloodTypeCipher = "O negative";
        profile.MedicalLastUpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        _crypto.Setup(c => c.Decrypt(It.IsAny<string>(), It.IsAny<string>())).Returns((string cipher, string _) => cipher);
        _crypto.Setup(c => c.Encrypt(It.IsAny<string>(), It.IsAny<string>())).Returns((string plain, string _) => plain);
        _repository
            .Setup(r => r.GetProfileByUserIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(profile);
        return profile;
    }

    private static SaveEmergencyProfileRequestDto SaveRequest(string bloodType, string contactName) => new()
    {
        IsEnabled = true,
        ConsentGiven = true,
        Fields = new Dictionary<string, string> { ["bloodType"] = bloodType },
        OfflineFields = ["bloodType"],
        Contacts = [new EmergencyContactDto { Name = contactName, Relationship = "Brother", Priority = 1 }],
    };

    [Fact]
    public async Task SaveProfileAsync_ChangingAnOfflineValue_RetiresTheIndex()
    {
        var profile = SavedProfile();

        await Service().SaveProfileAsync(SaveRequest("A positive", "Sipho"), Guid.NewGuid(), CancellationToken.None);

        _repository.Verify(r => r.AddRetiredRevocationIndexAsync(
            It.Is<RetiredEmergencyRevocationIndex>(x => x.RevocationIndex == EmergencyClaimNames.RevocationIndexOffset + 11),
            It.IsAny<CancellationToken>()), Times.Once);
        Assert.Null(profile.RevocationIndex);
        Assert.NotEqual(new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), profile.MedicalLastUpdatedAt);
    }

    [Fact]
    public async Task SaveProfileAsync_OnlyAContactNotReleasedOfflineChanges_KeepsTheIndexAndTheMedicalDate()
    {
        var profile = SavedProfile();

        await Service().SaveProfileAsync(SaveRequest("O negative", "Lwazi"), Guid.NewGuid(), CancellationToken.None);

        _repository.Verify(r => r.AddRetiredRevocationIndexAsync(
            It.IsAny<RetiredEmergencyRevocationIndex>(), It.IsAny<CancellationToken>()), Times.Never);
        Assert.Equal(EmergencyClaimNames.RevocationIndexOffset + 11, profile.RevocationIndex);
        Assert.Equal(new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), profile.MedicalLastUpdatedAt);
    }

    [Fact]
    public async Task SaveProfileAsync_EncryptsEachFieldBoundToItsProfileAndName()
    {
        var profile = SavedProfile();

        await Service().SaveProfileAsync(SaveRequest("O negative", "Sipho"), Guid.NewGuid(), CancellationToken.None);

        _crypto.Verify(c => c.Encrypt("O negative", $"{profile.Id:N}/bloodType"), Times.Once);
    }
}
