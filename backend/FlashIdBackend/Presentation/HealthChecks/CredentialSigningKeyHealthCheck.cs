using Application.Common.Interfaces.ProviderInterfaces;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Presentation.HealthChecks;

// The signing key is loaded on first use, so a missing or malformed key would otherwise only surface
// when a citizen asks for an offline package. This turns it into a deployment signal instead.
public class CredentialSigningKeyHealthCheck : IHealthCheck
{
    private readonly ICredentialSigningProvider _signingProvider;

    public CredentialSigningKeyHealthCheck(ICredentialSigningProvider signingProvider)
    {
        _signingProvider = signingProvider;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var key = await _signingProvider.GetActiveKeyAsync(cancellationToken);

            return HealthCheckResult.Healthy($"Credential signing key '{key.KeyId}' is loaded");
        }
        catch (Exception e)
        {
            // Names the setting rather than echoeing the exception text, whixh could carry key material.
            return HealthCheckResult.Unhealthy("The credential signing key is not configured or can't be loaded.", e);
        }
    }
}