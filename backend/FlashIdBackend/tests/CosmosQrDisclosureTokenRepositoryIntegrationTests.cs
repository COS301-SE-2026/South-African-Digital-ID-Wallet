using System.Security.Cryptography;
using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Repositories;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;

namespace tests;

public class CosmosQrDisclosureTokenRepositoryIntegrationTests
{
    private static (IQrDisclosureTokenRepository Repo, CosmosClient Client)? TryCreateRepository()
    {
        var connectonString = Environment.GetEnvironmentVariable("COSMOS_TEST_CONNECTION_STRING");

        if (string.IsNullOrWhiteSpace(connectonString)) return null;

        var hmacKey = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Cosmos:DatabaseName"] = Environment.GetEnvironmentVariable("COSMOS_TEST_DB_NAME") ?? "FlashIdQrDb",
                ["Cosmos:ContainerName"] =
                    Environment.GetEnvironmentVariable("COSMOS_TEST_CONTAINER_NAME") ?? "QrTokenClaims",
                ["Cosmos:CredentialIdHmacKey"] = hmacKey,
            })
            .Build();

        var client = new CosmosClient(connectonString, new CosmosClientOptions
        {
            SerializerOptions = new CosmosSerializationOptions { PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase },
        });

        return (new CosmosQrDisclosureTokenRepository(client, configuration), client);
    }

    [Fact]
    public async Task AddAsync_ThenTryMarkUsedAsync_ClaimsExactlyOnce()
    {
        var setup = TryCreateRepository();
        if (setup is null)
        {
            Assert.Skip("COSMOS_TEST_CONNECTION_STRING not set");
        }

        var (repository, client) = setup!.Value;
        using var _ = client;

        var token = new QrDisclosureToken
        {
            Id = Guid.NewGuid(),
            Jti = Guid.NewGuid(),
            CredentialId = Guid.NewGuid(),
            ExpiresAt = DateTime.UtcNow.AddMinutes(1),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await repository.AddAsync(token);

        var firstClaim = await repository.TryMarkUsedAsync(token.Jti);
        var secondClaim = await repository.TryMarkUsedAsync(token.Jti);

        Assert.True(firstClaim);
        Assert.False(secondClaim);
    }

    [Fact]
    public async Task InvalidateActiveTokensForCredentialAsync_InvalidatesUnclaimedToken()
    {
        var setup = TryCreateRepository();

        if (setup is null)
        {
            Assert.Skip("COSMOS_TEST_CONNECTION_STRING not set");
        }

        var (repository, client) = setup!.Value;
        using var _ = client;

        var credentialId = Guid.NewGuid();

        var token = new QrDisclosureToken
        {
            Id = Guid.NewGuid(),
            Jti = Guid.NewGuid(),
            CredentialId = credentialId,
            ExpiresAt = DateTime.UtcNow.AddMinutes(1),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await repository.AddAsync(token);
        await repository.InvalidateActiveTokensForCredentialAsync(credentialId);

        var claimed = await repository.TryMarkUsedAsync(token.Jti);

        Assert.False(claimed);
    }
}