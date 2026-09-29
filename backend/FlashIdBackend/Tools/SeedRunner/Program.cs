using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var connectionString = args.Length > 0
    ? args[0]
    : Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    Console.WriteLine("[SEED-RUNNER] No connection string provided.");
    return 1;
}

var options = new DbContextOptionsBuilder<AppDbContext>()
    .UseSqlServer(connectionString)
    .Options;

using var db = new AppDbContext(options);
await db.Database.MigrateAsync();
await DbSeeder.SeedAsync(db);
Console.WriteLine("[SEED-RUNNER] Seed complete.");
return 0;
