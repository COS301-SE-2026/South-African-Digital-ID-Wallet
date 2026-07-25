using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class BiometricsConfiguration : IEntityTypeConfiguration<Biometrics>
{
    public void Configure(EntityTypeBuilder<Biometrics> builder)
    {
        builder.HasKey(b => b.Id);

        builder.Property(b => b.FaceHash)
            .IsRequired()
            .HasMaxLength(512)
            .HasComment("SHA-256 hash of the face biometric data");

        builder.Property(b => b.FingerprintHash)
            .IsRequired()
            .HasMaxLength(512)
            .HasComment("SHA-256 hash of the fingerprint biometric data");

        builder.Property(b => b.CreatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.Property(b => b.UpdatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.Property(b => b.CredentialId)
            .IsRequired();

        builder.HasOne(b => b.Credential)
            .WithOne(c => c.Biometrics)
            .HasForeignKey<Biometrics>(b => b.CredentialId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(b => b.CredentialId).IsUnique();
    }
}