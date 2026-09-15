using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class SigningKeyConfiguration : IEntityTypeConfiguration<SigningKey>
{
    public void Configure(EntityTypeBuilder<SigningKey> builder)
    {
        builder.HasKey(k => k.Id);

        builder.Property(k => k.Kid).IsRequired().HasMaxLength(128);

        builder.Property(k => k.Purpose)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(16);

        builder.Property(k => k.Algorithm).IsRequired().HasMaxLength(32);

        builder.Property(k => k.PublicKeyJwk).IsRequired();

        builder.Property(k => k.KeyVaultKeyName).IsRequired().HasMaxLength(128);
        builder.Property(k => k.KeyVaultKeyVersion).IsRequired().HasMaxLength(64);

        builder.Property(k => k.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(16);

        builder.Property(k => k.CreatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.Property(k => k.UpdatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.HasIndex(k => k.Kid).IsUnique();
        builder.HasIndex(k => new { k.Purpose, k.Status });
    }
}