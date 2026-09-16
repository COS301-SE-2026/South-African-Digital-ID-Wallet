using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class EmergencyProfileConfiguration : IEntityTypeConfiguration<EmergencyProfile>
{
    public void Configure(EntityTypeBuilder<EmergencyProfile> builder)
    {
        builder.HasKey(p => p.Id);

        builder.HasIndex(p => p.CitizenId).IsUnique();

        builder.Property(p => p.OfflineFieldsJson)
            .IsRequired()
            .HasMaxLength(500);

        builder.HasMany(p => p.Contacts)
            .WithOne(c => c.EmergencyProfile)
            .HasForeignKey(c => c.EmergencyProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Accesses)
            .WithOne(a => a.EmergencyProfile)
            .HasForeignKey(a => a.EmergencyProfileId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
