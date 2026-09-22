using System.Net;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Services;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.Azure.Cosmos;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Repositories;

public class EmergencyRepository : IEmergencyRepository
{
    private const int ClaimTtlSeconds = 300;

    private readonly AppDbContext _context;
    private readonly Container _claims;

    public EmergencyRepository(AppDbContext context, CosmosClient cosmosClient, IConfiguration configuration)
    {
        _context = context;

        var dbName = configuration["Cosmos:DatabaseName"]
            ?? throw new InvalidOperationException("Cosmos:DatabaseName is not configured.");
        var containerName = configuration["Cosmos:ContainerName"]
            ?? throw new InvalidOperationException("Cosmos:ContainerName is not configured.");

        _claims = cosmosClient.GetContainer(dbName, containerName);
    }

    public Task<EmergencyDevice?> GetActiveDeviceByHandleAsync(byte[] handle, CancellationToken ct) =>
        _context.EmergencyDevices
            .FirstOrDefaultAsync(d => d.Handle == handle && d.RevokedAt == null, ct);

    public Task<EmergencyDevice?> GetActiveDeviceByCitizenIdAsync(Guid citizenId, CancellationToken ct) =>
        _context.EmergencyDevices
            .FirstOrDefaultAsync(d => d.CitizenId == citizenId && d.RevokedAt == null, ct);

    public Task<EmergencyProfile?> GetEnabledProfileWithContactsAsync(Guid citizenId, CancellationToken ct) =>
        _context.EmergencyProfiles
            .Include(p => p.Contacts)
            .Include(p => p.Citizen)
            .FirstOrDefaultAsync(
                p => p.CitizenId == citizenId && p.IsEnabled && p.ConsentGivenAt != null, ct);

    public Task<EmergencyProfile?> GetProfileByUserIdAsync(Guid userId, CancellationToken ct) =>
        _context.EmergencyProfiles
            .Include(p => p.Contacts)
            .Include(p => p.Citizen)
            .FirstOrDefaultAsync(p => p.Citizen.UserId == userId, ct);

    public Task<EmergencyAccess?> GetAccessWithContactsAsync(Guid accessId, CancellationToken ct) =>
        _context.EmergencyAccesses
            .Include(a => a.EmergencyProfile).ThenInclude(p => p.Contacts)
            .Include(a => a.EmergencyProfile).ThenInclude(p => p.Citizen)
                .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(a => a.Id == accessId, ct);

    public Task<List<EmergencyAccess>> GetAccessHistoryByUserIdAsync(Guid userId, CancellationToken ct) =>
        _context.EmergencyAccesses
            .Where(a => a.EmergencyProfile.Citizen.UserId == userId)
            .OrderByDescending(a => a.AccessedAt)
            .ToListAsync(ct);

    public Task<Official?> GetResponderAsync(Guid responderUserId, CancellationToken ct) =>
        _context.Officials
            .Include(o => o.Institution)
            .FirstOrDefaultAsync(
                o => o.UserId == responderUserId
                    && o.User.Role == UserRole.Official
                    && (o.Institution.Type == InstitutionType.Healthcare
                        || o.Institution.Type == InstitutionType.LawEnforcement), ct);

    public async Task<bool> TryClaimCodeAsync(byte[] handle, DateTimeOffset issuedAt, CancellationToken ct)
    {
        var id = $"emg:{EmergencyBase64Url.Encode(handle)}:{issuedAt.ToUnixTimeSeconds()}";

        try
        {
            await _claims.CreateItemAsync(
                new EmergencyCodeClaimDocument { Id = id, ClaimedAt = DateTime.UtcNow, Ttl = ClaimTtlSeconds },
                new PartitionKey(id),
                cancellationToken: ct);

            return true;
        }
        catch (CosmosException ce) when (ce.StatusCode == HttpStatusCode.Conflict)
        {
            return false;
        }
    }

    public async Task AddDeviceAsync(EmergencyDevice device, CancellationToken ct) =>
        await _context.EmergencyDevices.AddAsync(device, ct);

    public async Task AddAccessAsync(EmergencyAccess access, CancellationToken ct) =>
        await _context.EmergencyAccesses.AddAsync(access, ct);

    public async Task AddProfileAsync(EmergencyProfile profile, CancellationToken ct) =>
        await _context.EmergencyProfiles.AddAsync(profile, ct);

    public Task SaveChangesAsync(CancellationToken ct) => _context.SaveChangesAsync(ct);
}

internal sealed class EmergencyCodeClaimDocument
{
    public string Id { get; set; } = string.Empty;
    public DateTime ClaimedAt { get; set; }
    public int Ttl { get; set; }
}
