using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.Data.Sqlite;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class OfflinePackageRepository : IOfflinePackageRepository
{
    // SQL server: 2601 is a duplicate key in a unique index, 2627 a unique constraint violation.
    private const int SqlServerDuplicateKey = 2601;
    private const int SqlServerUniqueConstraint = 2627;
    // SqLite groups every constraint failure under errror code 19, used by integration tests
    private const int SqliteConstraintViolation = 19;
    private readonly AppDbContext _context;

    public OfflinePackageRepository(AppDbContext context)
    {
        _context = context;
    }

    // Tracked on purposeL the minted pakage is written back onto this entry
    public async Task<Credential?> GetForPackagingAsync(Guid credentialId, CancellationToken cancellationToken) =>
        await _context.Credentials
            .Include(c => c.Citizen)
            .Include(c => c.IdentityDocument)
            .Include(c => c.DriversLicense)
            .FirstOrDefaultAsync(c => c.Id == credentialId, cancellationToken);

    public async Task<int> NextRevocationIndexAsync(CancellationToken cancellationToken)
    {
        // Cast to int? so an empty table returns null rather than throwing on Max
        var highest = await _context.Credentials.MaxAsync(c => (int?)c.RevocationIndex, cancellationToken);

        return (highest ?? 0) + 1;
    }

    public async Task<bool> TrySaveMintedPackageAsync(CancellationToken cancellationToken)
    {
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateException due) when (IsUniqueIndexViolation(due))
        {
            // 2 citizens minted at the same moment and picked the same index. Nothing written
            return false;
        }
    }

    private static bool IsUniqueIndexViolation(DbUpdateException due) => due.InnerException switch
    {
        SqlException se => se.Number is SqlServerDuplicateKey or SqlServerUniqueConstraint,
        SqliteException sle => sle.SqliteErrorCode == SqliteConstraintViolation,
        _ => false,
    };
}
