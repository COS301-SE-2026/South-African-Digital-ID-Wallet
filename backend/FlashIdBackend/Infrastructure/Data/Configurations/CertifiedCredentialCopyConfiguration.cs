using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class CertifiedCredentialCopyConfiguration : IEntityTypeConfiguration<CertifiedCredentialCopy>
{
    public void Configure(EntityTypeBuilder<CertifiedCredentialCopy> builder)
    {
        builder.ToTable("CertifiedCredentialCopies");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.VerificationTokenHash).IsRequired().HasMaxLength(64);
        builder.Property(c => c.CredentialSnapshotHash).IsRequired().HasMaxLength(64);
        builder.Property(c => c.GeneratedAt).IsRequired();
        builder.Property(c => c.ExpiresAt).IsRequired(false);
        builder.Property(c => c.RevokedAt).IsRequired(false);
        builder.Property(c => c.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.HasIndex(c => c.VerificationTokenHash).IsUnique();
        builder.HasIndex(c => c.CitizenId);
        builder.HasIndex(c => c.CredentialId);
        builder.HasOne(c => c.Credential).WithMany().HasForeignKey(c => c.CredentialId).OnDelete(DeleteBehavior.Restrict);
    }
}