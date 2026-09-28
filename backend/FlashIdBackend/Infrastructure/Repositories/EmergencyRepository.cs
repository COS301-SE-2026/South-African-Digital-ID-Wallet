using System.Net;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Services;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.Azure.Cosmos;
using Microsoft.Data.SqlClient;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Repositories;

public class EmergencyRepository : IEmergencyRepository
{
    private const int ClaimTtlSeconds = 300;
    private const int SqlServerDuplicateKey = 2601;
    private const int SqlServerUniqueConstraint = 2627;
    private const int SqliteUniqueConstraint = 2067;

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

    public async Task<int> NextRevocationIndexAsync(CancellationToken ct)
    {
        var highestLive = await _context.EmergencyProfiles.MaxAsync(p => p.RevocationIndex, ct);
        var highestRetired = await _context.RetiredEmergencyRevocationIndexes
            .MaxAsync(r => (int?)r.RevocationIndex, ct);

        var highest = Math.Max(highestLive ?? 0, highestRetired ?? 0);

        return Math.Max(highest + 1, EmergencyClaimNames.RevocationIndexOffset);
    }

    public async Task<bool> TrySaveChangesAsync(CancellationToken ct)
    {
        try
        {
            await _context.SaveChangesAsync(ct);
            return true;
        }
        catch (DbUpdateException due) when (IsUniqueIndexViolation(due))
        {
            return false;
        }
    }

    public async Task AddRetiredRevocationIndexAsync(RetiredEmergencyRevocationIndex retired, CancellationToken ct) =>
        await _context.RetiredEmergencyRevocationIndexes.AddAsync(retired, ct);

    public async Task<EmergencyProfile?> GetProfileByRevocationIndexAsync(int revocationIndex, CancellationToken ct)
    {
        var live = await _context.EmergencyProfiles
            .Include(p => p.Citizen)
            .FirstOrDefaultAsync(p => p.RevocationIndex == revocationIndex, ct);

        if (live is not null)
        {
            return live;
        }

        var retired = await _context.RetiredEmergencyRevocationIndexes
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.RevocationIndex == revocationIndex, ct);

        return retired is null
            ? null
            : await _context.EmergencyProfiles
                .Include(p => p.Citizen)
                .FirstOrDefaultAsync(p => p.Id == retired.EmergencyProfileId, ct);
    }

    public Task<bool> AccessExistsAsync(Guid accessId, CancellationToken ct) =>
        _context.EmergencyAccesses.AnyAsync(a => a.Id == accessId, ct);

    public Task<Official?> GetOfficialAsync(Guid userId, CancellationToken ct) =>
        _context.Officials
            .Include(o => o.Institution)
            .FirstOrDefaultAsync(o => o.UserId == userId, ct);

    private static bool IsUniqueIndexViolation(DbUpdateException due) => due.InnerException switch
    {
        SqlException se => se.Number is SqlServerDuplicateKey or SqlServerUniqueConstraint,
        SqliteException sle => sle.SqliteExtendedErrorCode == SqliteUniqueConstraint,
        _ => false,
    };
}

internal sealed class EmergencyCodeClaimDocument
{
    public string Id { get; set; } = string.Empty;
    public DateTime ClaimedAt { get; set; }
    public int Ttl { get; set; }
}
