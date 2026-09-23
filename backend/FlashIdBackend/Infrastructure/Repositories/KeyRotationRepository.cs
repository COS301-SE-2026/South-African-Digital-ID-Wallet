using Application.Common.Interfaces.RepositoryInterfaces;
using Infrastructure.Data;

namespace Infrastructure.Repositories;

public class KeyRotationRepository : JobRunRepositoryBase, IKeyRotationRepository
{
    public KeyRotationRepository(AppDbContext context) : base(context)
    {
    }
}
