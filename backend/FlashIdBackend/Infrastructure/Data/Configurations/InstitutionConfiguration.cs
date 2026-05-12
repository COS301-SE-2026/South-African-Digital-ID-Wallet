using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class InstitutionConfiguration : IEntityTypeConfiguration<Institution>
{
    public void Configure(EntityTypeBuilder<Institution> builder)
    {
        builder.HasKey(i => i.Id);

        builder.Property(i => i.Name)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(i => i.Type)
            .IsRequired()
            .HasConversion<string>();

        // KeyVault stores secrets; we persist a GUID reference to the secret
        builder.Property(i => i.ApiKeyReference)
            .IsRequired();

        builder.Property(i => i.VerificationNumber)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(i => i.CreatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.Property(i => i.UpdatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAddOrUpdate();

        builder.Property(i => i.RegisteredById)
            .IsRequired();

        builder.HasIndex(i => i.ApiKeyReference).IsUnique();
        
        builder.HasIndex(i => i.VerificationNumber).IsUnique();
        
        builder.HasOne(i => i.RegisteredBy)
            .WithMany(g => g.RegisteredInstitutions)
            .HasForeignKey(i => i.RegisteredById)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasMany(i => i.Officials)
            .WithOne(o => o.Institution)
            .HasForeignKey(o => o.InstitutionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
