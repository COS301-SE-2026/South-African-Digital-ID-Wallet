using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class CredentialConfiguration : IEntityTypeConfiguration<Credential>
{
    public void Configure(EntityTypeBuilder<Credential> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Status)
            .IsRequired()
            .HasConversion<string>();
        
        builder.Property(c => c.Signature)
            .IsRequired()
            .HasMaxLength(1024);
        
        builder.Property(c => c.IssuedBy)
            .IsRequired()
            .HasMaxLength(256);
        
        builder.Property(c => c.CreatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.Property(c => c.UpdatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .ValueGeneratedOnAddOrUpdate();
        
        builder.Property(c => c.CitizenId)
            .IsRequired();

        builder.HasOne(c => c.Citizen)
            .WithMany(citizen => citizen.Credentials)
            .HasForeignKey(c => c.CitizenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.IdentityDocument)
            .WithOne(id => id.Credential)
            .HasForeignKey<IdentityDocument>(id => id.CredentialId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(c => c.DriversLicense)
            .WithOne(dl => dl.Credential)
            .HasForeignKey<DriversLicense>(dl => dl.CredentialId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(c => c.Biometrics)
            .WithOne(b => b.Credential)
            .HasForeignKey<Biometrics>(b => b.CredentialId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasComment("Credential has optional biometrics; cascades to biometrics when credential is deleted");
    }
}

