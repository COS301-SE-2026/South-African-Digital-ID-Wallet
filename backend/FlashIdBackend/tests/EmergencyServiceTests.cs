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
using Moq;

namespace tests;

public class EmergencyServiceTests
{
    private static readonly byte[] Context = Encoding.ASCII.GetBytes("FIDEMG1");

    private readonly Mock<IEmergencyRepository> _repository = new();
    private readonly Mock<ICredentialRepository> _credentials = new();
    private readonly Mock<IInstitutionRepository> _audit = new();
    private readonly Mock<IPhotoStorageProvider> _photos = new();
    private readonly Mock<IQrSigningProvider> _signing = new();
    private readonly Mock<IEmergencyNotifier> _notifier = new();
    private readonly Mock<IFieldCryptoProvider> _crypto = new();

    private readonly Guid _responderUserId = Guid.NewGuid();
    private readonly byte[] _handle = Enumerable.Range(0, 16).Select(i => (byte)i).ToArray();

    private EmergencyService Service() => new(
        _repository.Object, _credentials.Object, _audit.Object,
        _photos.Object, _signing.Object, _notifier.Object, _crypto.Object);

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
        _crypto.Setup(c => c.Decrypt(It.IsAny<string>())).Returns("O negative");

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

        _notifier.Verify(n => n.NotifyEmergencyAccessAsync(
            It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Once);
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

    [Fact]
    public async Task BuildOfflineCredentialAsync_ReleasedFieldsOnly_SignsThePayload()
    {
        var citizenId = Guid.NewGuid();
        _repository
            .Setup(r => r.GetProfileByUserIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Profile(citizenId));
        _repository
            .Setup(r => r.GetActiveDeviceByCitizenIdAsync(citizenId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new EmergencyDevice
            {
                Id = Guid.NewGuid(),
                CitizenId = citizenId,
                Handle = _handle,
                PublicKeySpki = new byte[] { 1 },
                Platform = "android",
            });
        _crypto.Setup(c => c.Decrypt(It.IsAny<string>())).Returns("O negative");
        _signing.Setup(s => s.Sign(It.IsAny<string>())).Returns("signature");

        var result = await Service().BuildOfflineCredentialAsync(Guid.NewGuid(), CancellationToken.None);

        Assert.Equal("signature", result.Signature);
        Assert.NotEmpty(result.Payload);
        Assert.True(result.ExpiresAt > DateTime.UtcNow.AddDays(80));

        var json = Encoding.UTF8.GetString(EmergencyBase64Url.Decode(result.Payload));
        Assert.Contains("emergency-offline", json);
        Assert.Contains("O negative", json);
    }
}
