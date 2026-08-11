using Domain.Entities;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace Infrastructure.Data;

//DbContext is the bridge between backend C# & the db. Everything db related goes through here.
public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    //DbSet<T> represents a table in the database.
    public DbSet<Biometrics> Biometrics => Set<Biometrics>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<Citizen> Citizens => Set<Citizen>();
    public DbSet<Credential> Credentials => Set<Credential>();
    public DbSet<DriversLicense> DriversLicenses => Set<DriversLicense>();
    public DbSet<GovernmentAdministrator> GovernmentAdministrators => Set<GovernmentAdministrator>();
    public DbSet<IdentityDocument> IdentityDocuments => Set<IdentityDocument>();
    public DbSet<Institution> Institutions => Set<Institution>();
    public DbSet<Official> Officials => Set<Official>();
    public DbSet<User> DomainUsers => Set<User>();
    public DbSet<UserPreferences> UserPreferences => Set<UserPreferences>();
    public DbSet<CitizenActivation> CitizenActivations => Set<CitizenActivation>();
    public DbSet<TrustedDevice> TrustedDevices => Set<TrustedDevice>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<DeviceVerification> DeviceVerifications => Set<DeviceVerification>();
    public DbSet<JobRun> JobRun => Set<JobRun>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        //this lets IdentityDbContext set up its own tables
        base.OnModelCreating(builder);

        //scan the Infrastructure assembly and automatically find every class that implements IEntityTypeConfiguration<T>
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}