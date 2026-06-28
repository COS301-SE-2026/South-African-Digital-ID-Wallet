using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace Infrastructure.Data.Configurations;

public class CitizenRecordsConfiguration : IEntityTypeConfiguration<CitizenRecords>
{
    public void Configure(EntityTypeBuilder<CitizenRecords> builder)
    {
        builder.HasKey(c => c.Id);
        builder.HasIndex(c => c.SaId).IsUnique();
        builder.Property(c=> c.Names).IsRequired().HasMaxLength(100);
        builder.Property(u => u.Surname)
            .IsRequired()
            .HasMaxLength(100);
        builder.Property(c => c.Gender)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.DateOfBirth).IsRequired();
    }
}