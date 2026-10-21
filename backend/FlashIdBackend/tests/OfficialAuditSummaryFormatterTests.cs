using Application.Common.Mapping;
using Domain.Enums;

namespace tests;

public class OfficialAuditSummaryFormatterTests
{
    [Theory]
    [InlineData("Credential abc verified via QR disclosure (3 field(s)).", "Identity Document · 3 fields disclosed")]
    [InlineData("Credential abc verified via QR disclosure (1 field(s)).", "Identity Document · 1 field disclosed")]
    [InlineData("Older wording without a count", "Identity Document verified")] // fallback if the Details text ever changes
    public void CredentialVerified_UsesFieldCountWhenPresent(string details, string expected) =>
        Assert.Equal(expected, OfficialAuditSummaryFormatter.Format(AuditEventType.CredentialVerified, details, "Identity Document"));

    [Fact]
    public void OfflineVerified_ShowsCredentialTypeOnly() =>
        Assert.Equal("Driver's Licence · offline scan", OfficialAuditSummaryFormatter.Format(AuditEventType.OfflineCredentialVerified, "Offline verification. Result: VERIFIED.", "Driver's Licence"));

    [Fact]
    public void MissingCredentialType_FallsBackToCredential() =>
        Assert.Equal("Credential · offline scan", OfficialAuditSummaryFormatter.Format(AuditEventType.OfflineCredentialVerified, "x", null));

    [Fact]
    public void OfflineRejected_HasFixedText() =>
        Assert.Equal("Offline scan rejected", OfficialAuditSummaryFormatter.Format(AuditEventType.OfflineVerificationRejected, "x", null));

    [Fact]
    public void OtherEvents_KeepTheirDetails() =>
        Assert.Equal("Citizen onboarded.", OfficialAuditSummaryFormatter.Format(AuditEventType.OnboardCitizen, "Citizen onboarded.", null));

    [Fact]
    public void AccountEvents_UseShortLabelsInsteadOfTheLogSentence() =>
        Assert.Equal("New device trusted", OfficialAuditSummaryFormatter.Format(
            AuditEventType.DeviceVerified, "User someone@flashid.local verified and trusted a new device.", null));

    [Fact]
    public void ConsentRecorded_IsCitizenWork() =>
        Assert.Contains(AuditEventType.ConsentRecorded, (IReadOnlySet<AuditEventType>)AuditEventTypeExtensions.OfficialWorkEvents);
}
