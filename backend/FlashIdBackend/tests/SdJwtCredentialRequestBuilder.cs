using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Services;
using Application.Features.Credentials.Enums;

namespace tests;

// Builder pattern, used properly here: each test assembles a request step by step, choosing only the
// steps it cares about, and the defaults keep the other tests short.
internal sealed class SdJwtCredentialRequestBuilder
{
    private string _vct = SdJwtClaimNames.DriversLicenseVct;
    private readonly Dictionary<string, string> _claims = new(StringComparer.Ordinal)
    {
        [SdJwtClaimNames.Portrait] = "fake-portrait-bytes",
        [SdJwtClaimNames.ExpiryDate] = "2030-06-30",
        [SdJwtClaimNames.DateOfBirth] = "1998-03-14",
        [SdJwtClaimNames.FullName] = "Thabo Test Mokoena",
    };
    private IReadOnlyCollection<string> _mandatoryClaimNames = SdJwtClaimNames.MandatoryClaimsFor(CredentialType.DriversLicense);
    private long _revocationIndex = 1001;
    private DateTimeOffset? _documentExpiresAt;
    private EcPublicJwk? _deviceKey;

    public SdJwtCredentialRequestBuilder WithVct(string vct)
    {
        _vct = vct;
        return this;
    }

    public SdJwtCredentialRequestBuilder WithClaim(string name, string value)
    {
        _claims[name] = value;
        return this;
    }

    public SdJwtCredentialRequestBuilder WithoutClaim(string name)
    {
        _claims.Remove(name);
        return this;
    }

    public SdJwtCredentialRequestBuilder WithOnlyClaims(params (string Name, string Value)[] claims)
    {
        _claims.Clear();
        foreach (var (name, value) in claims)
        {
            _claims[name] = value;
        }

        return this;
    }

    public SdJwtCredentialRequestBuilder WithMandatoryClaimNames(params string[] names)
    {
        _mandatoryClaimNames = names;
        return this;
    }

    public SdJwtCredentialRequestBuilder WithRevocationIndex(long revocationIndex)
    {
        _revocationIndex = revocationIndex;
        return this;
    }

    public SdJwtCredentialRequestBuilder WithDocumentExpiry(DateTimeOffset documentExpiresAt)
    {
        _documentExpiresAt = documentExpiresAt;
        return this;
    }

    public SdJwtCredentialRequestBuilder WithDeviceKey(EcPublicJwk deviceKey)
    {
        _deviceKey = deviceKey;
        return this;
    }

    public SdJwtCredentialRequest Build() => new()
    {
        Vct = _vct,
        Claims = _claims,
        MandatoryClaimNames = _mandatoryClaimNames,
        RevocationIndex = _revocationIndex,
        DocumentExpiresAt = _documentExpiresAt,
        DeviceKey = _deviceKey,
    };
}
