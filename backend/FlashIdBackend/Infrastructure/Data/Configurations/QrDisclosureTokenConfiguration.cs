using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class QrDisclosureTokenConfiguration : IEntityTypeConfiguration<QrDisclosureToken>
{
    private const string DateTime2 = "datetime2";
    public void Configure(EntityTypeBuilder<QrDisclosureToken> builder)
    {
        builder.HasKey(q => q.Id);

        builder.HasIndex(q => q.Jti)
            .IsUnique();

        builder.Property(q => q.ExpiresAt)
            .IsRequired()
            .HasColumnType(DateTime2);

        builder.Property(q => q.UsedAt)
            .HasColumnType(DateTime2);

        builder.Property(q => q.CreatedAt)
            .IsRequired()
            .HasColumnType(DateTime2)
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.Property(q => q.UpdatedAt)
            .IsRequired()
            .HasColumnType(DateTime2)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(q => q.Credential)
            .WithMany()
            .HasForeignKey(q => q.CredentialId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}