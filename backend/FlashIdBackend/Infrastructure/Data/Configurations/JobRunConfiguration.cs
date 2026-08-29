using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class JobRunConfiguration : IEntityTypeConfiguration<JobRun>
{
    private readonly string datetime2 = "datetime2";
    public void Configure(EntityTypeBuilder<JobRun> builder)
    {
        builder.HasKey(j => j.Id);

        builder.Property(j => j.JobName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(j => j.RunDate)
            .IsRequired()
            .HasColumnType(datetime2);

        builder.Property(j => j.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(j => j.ErrorMessage)
            .HasMaxLength(2000);

        builder.Property(j => j.CreatedAt)
            .IsRequired()
            .HasColumnType(datetime2)
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.Property(j => j.UpdatedAt)
            .IsRequired()
            .HasColumnType(datetime2)
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.HasIndex(j => new { j.JobName, j.RunDate })
            .IsUnique();
    }
}