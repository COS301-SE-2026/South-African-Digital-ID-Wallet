using System.Net;
using System.Security.Cryptography;
using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Repositories;

public class CosmosQrDisclosureTokenRepository : IQrDisclosureTokenRepository
{
    private const int ClaimTtlSeconds = 120;
    private readonly Container _container;
    private readonly byte[] _hmacKey;

    public CosmosQrDisclosureTokenRepository(CosmosClient cosmosClient, IConfiguration configuration)
    {
        var dbName = configuration["Cosmos:DatabaseName"] ?? throw new InvalidOperationException("Cosmos:DatabaseName is not configured.");
        var containerName = configuration["Cosmos:ContainerName"] ?? throw new InvalidOperationException("Cosmos:ContainerName is not configured.");
        var hmacKeyBase64 = configuration["Cosmos:CredentialIdHmacKey"] ?? throw new InvalidOperationException("Cosmos:CredentialIdHmacKey is not configured.");

        _container = cosmosClient.GetContainer(dbName, containerName);
        _hmacKey = Convert.FromBase64String(hmacKeyBase64);
    }

    // creates the claim doc at QR generation time
    public async Task AddAsync(QrDisclosureToken token)
    {
        var doc = new QrTokenClaimDocument
        {
            Id = token.Jti.ToString(),
            Jti = token.Jti,
            CredentialIdHash = HashCredentialId(token.CredentialId),
            UsedAt = null,
            ExpiresAt = token.ExpiresAt,
            Ttl = ClaimTtlSeconds,
        };

        await _container.CreateItemAsync(doc, new PartitionKey(doc.Id));
    }

    // atomically claims a token exactly once
    public async Task<bool> TryMarkUsedAsync(Guid jti)
    {
        var id = jti.ToString();

        try
        {
            var response = await _container.ReadItemAsync<QrTokenClaimDocument>(id, new PartitionKey(id));
            var doc = response.Resource;

            if (doc.UsedAt != null || doc.ExpiresAt <= DateTime.UtcNow) return false;

            doc.UsedAt = DateTime.UtcNow;

            await _container.ReplaceItemAsync(doc, id, new PartitionKey(id), new ItemRequestOptions { IfMatchEtag = response.ETag });

            return true;
        }
        catch (CosmosException ce) when (ce.StatusCode is HttpStatusCode.NotFound or HttpStatusCode.PreconditionFailed)
        {
            return false;
        }
    }

    // called when a new QR is generated for a credential. Kills any active/previous QR for same cred.
    public async Task InvalidateActiveTokensForCredentialAsync(Guid credentialId)
    {
        var hash = HashCredentialId(credentialId);

        // have to use Microsoft's native Cosmos SDK
        var query = new QueryDefinition(
            "SELECT * FROM c WHERE c.credentialIdHash = @hash AND c.usedAt = null AND c.expiresAt > @now")
                .WithParameter("@hash", hash)
                .WithParameter("@now", DateTime.UtcNow);

        using var iterator = _container.GetItemQueryIterator<QrTokenClaimDocument>(query);
        while (iterator.HasMoreResults)
        {
            var page = await iterator.ReadNextAsync();
            foreach (var doc in page)
            {
                doc.UsedAt = DateTime.UtcNow;
                try
                {
                    await _container.ReplaceItemAsync(doc, doc.Id, new PartitionKey(doc.Id));
                }
                catch (CosmosException ce) when (ce.StatusCode is HttpStatusCode.NotFound or HttpStatusCode.PreconditionFailed)
                {
                    // already claimed by a concurrent scan, or ttl ecpired, between query and this replace.
                }
            }
        }
    }

    // keyed hash of raw credentialId, so read access to this container alone can't be joined back to a real credential in SQL
    private string HashCredentialId(Guid credentialId)
    {
        using var hmac = new HMACSHA256(_hmacKey);
        var hash = hmac.ComputeHash(credentialId.ToByteArray());

        return Convert.ToHexString(hash);
    }
}

internal sealed class QrTokenClaimDocument
{
    public string Id { get; set; } = string.Empty;
    public Guid Jti { get; set; }
    public string CredentialIdHash { get; set; } = string.Empty;
    public DateTime? UsedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public int Ttl { get; set; }
}