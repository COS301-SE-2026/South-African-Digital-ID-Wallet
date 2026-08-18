using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class ApiKeyRevealTokenConfiguration : IEntityTypeConfiguration<ApiKeyRevealToken>
{
    public void Configure(EntityTypeBuilder<ApiKeyRevealToken> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.ExpiresAt)
            .IsRequired()
            .HasColumnType("datetime2");

        builder.Property(t => t.CreatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.Property(t => t.UpdatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.HasIndex(t => t.InstitutionId);
        builder.HasIndex(t => t.ExpiresAt);

        builder.HasOne(t => t.Institution)
            .WithMany(i => i.ApiKeyRevealTokens)
            .HasForeignKey(t => t.InstitutionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}