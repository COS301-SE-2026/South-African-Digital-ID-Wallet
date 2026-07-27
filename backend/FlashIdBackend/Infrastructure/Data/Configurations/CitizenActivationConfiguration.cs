using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class CitizenActivationConfiguration : IEntityTypeConfiguration<CitizenActivation>
{
    public void Configure(EntityTypeBuilder<CitizenActivation> builder)
    {
        builder.ToTable("CitizenActivations");
        const string dateFormat = "datetime2";

        builder.HasKey(a => a.Id);

        builder.Property(a => a.TokenHash)
            .IsRequired()
            .HasMaxLength(64)
            .IsUnicode(false);

        builder.Property(a => a.PinHash)
            .IsRequired()
            .HasMaxLength(100)
            .IsUnicode(false);

        builder.Property(a => a.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(ActivationStatus.Pending);

        builder.Property(a => a.ExpiresAt)
            .IsRequired()
            .HasColumnType(dateFormat);

        builder.Property(a => a.LockedUntil)
            .HasColumnType(dateFormat);

        builder.Property(a => a.UsedAt)
            .HasColumnType(dateFormat);

        builder.Property(a => a.RevokedAt)
            .HasColumnType(dateFormat);

        builder.Property(a => a.RevokedReason)
            .HasMaxLength(256);

        builder.Property(a => a.CreatedAt)
            .IsRequired()
            .HasColumnType(dateFormat)
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.Property(a => a.UpdatedAt)
            .IsRequired()
            .HasColumnType(dateFormat)
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.HasIndex(a => a.TokenHash)
            .IsUnique();

        builder.HasIndex(a => new
        {
            a.CitizenId,
            a.Status
        });

        builder.HasOne(a => a.Citizen)
            .WithMany(c => c.Activations)
            .HasForeignKey(a => a.CitizenId)
            .OnDelete(DeleteBehavior.Cascade);
    }

}