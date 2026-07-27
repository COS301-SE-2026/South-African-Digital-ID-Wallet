using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace Infrastructure.Data.Configurations;

public class CitizenRecordConfiguration : IEntityTypeConfiguration<CitizenRecord>
{
    public void Configure(EntityTypeBuilder<CitizenRecord> builder)
    {
        builder.ToTable("CitizenRecords");

        builder.HasKey(c => c.Id);

        builder.HasIndex(c => c.SaId).IsUnique();

        builder.Property(c => c.SaId)
            .IsRequired()
            .HasMaxLength(13);

        builder.Property(c => c.Names).IsRequired().HasMaxLength(100);

        builder.Property(c => c.Surname)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Gender)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.DateOfBirth).IsRequired();

        builder.HasMany(c => c.Credentials)
            .WithOne(c => c.Citizen)
            .HasForeignKey(c => c.CitizenId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}