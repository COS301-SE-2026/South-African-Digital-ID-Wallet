using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class QrDisclosureTokenConfiguration : IEntityTypeConfiguration<QrDisclosureToken>
{
    public void Configure(EntityTypeBuilder<QrDisclosureToken> builder)
    {
        builder.HasKey(q => q.Id);

        builder.HasIndex(q => q.Jti)
            .IsUnique();

        builder.Property(q => q.ExpiresAt)
            .IsRequired()
            .HasColumnType("datetime2");

        builder.Property(q => q.UsedAt)
            .HasColumnType("datetime2");

        builder.Property(q => q.CreatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.Property(q => q.UpdatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(q => q.Credential)
            .WithMany()
            .HasForeignKey(q => q.CredentialId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}