using Application.Common.Interfaces.ProviderInterfaces;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Presentation.HealthChecks;

namespace tests;

public class CredentialSigningKeyHealthCheckTests
{
    private sealed class BrokenSigningProvider : ICredentialSigningProvider
    {
        public Task<CredentialSigningKey> GetActiveKeyAsync(CancellationToken cancellationToken) =>
            Task.FromException<CredentialSigningKey>(new InvalidOperationException("Credential signing key id is not configured."));

        public Task<byte[]> SignAsync(string keyId, byte[] signingInput, CancellationToken cancellationToken) =>
            throw new NotImplementedException("Not exercised by these tests.");
    }

    [Fact]
    public async Task CheckHealthAsync_KeyLoads_ReportsHealthy()
    {

        using var signingProvider = new TestSigningProvider();

        var result = await new CredentialSigningKeyHealthCheck(signingProvider)
            .CheckHealthAsync(new HealthCheckContext(), TestContext.Current.CancellationToken);

        Assert.Equal(HealthStatus.Healthy, result.Status);
        Assert.Contains("test-key-1", result.Description, StringComparison.Ordinal);
    }

    [Fact]
    public async Task CheckHealthAsync_KeyMisconfigured_ReportsUnhealthyWithoutLeakingDetail()
    {
        var result = await new CredentialSigningKeyHealthCheck(new BrokenSigningProvider())
            .CheckHealthAsync(new HealthCheckContext(), TestContext.Current.CancellationToken);

        Assert.Equal(HealthStatus.Unhealthy, result.Status);
        Assert.NotNull(result.Exception);
        Assert.DoesNotContain("key id is not configured", result.Description, StringComparison.Ordinal);
    }
}
