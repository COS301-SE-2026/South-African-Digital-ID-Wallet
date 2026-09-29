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

        builder.Property(c => c.IssueDate)
            .IsRequired()
            .HasColumnType("datetime2");

        builder.Property(c => c.CreatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.Property(c => c.UpdatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

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
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(c => c.IdFrontImagePath)
            .HasMaxLength(512);

        builder.Property(c => c.IdBackImagePath)
            .HasMaxLength(512);

        builder.Property(c => c.SelfieImagePath)
            .HasMaxLength(512);

        // Left as nvarchar(max): the issuer JWT grows with the number of claims, and the disclosure set carries the base64url portrait, which measured up to about 4.8 KB in Spike C.
        builder.Property(c => c.IssuerSignedCredential);

        builder.Property(c => c.DisclosureSet);

        builder.Property(c => c.SigningKid)
            .HasMaxLength(128);

        // base64url of a sha-256 thumbprint is 43 chars
        builder.Property(c => c.HolderKeyThumbprint)
            .HasMaxLength(64);

        builder.Property(c => c.SignedAt)
            .HasColumnType("datetimeoffset");

        builder.Property(c => c.PackageExpiresAt)
            .HasColumnType("datetimeoffset");

        // Filtered so the many creds with no index yet do not collide. SQL Server treats NULLs as equal in a unique index and would allow only one.
        builder.HasIndex(c => c.RevocationIndex)
            .IsUnique()
            .HasFilter("[RevocationIndex] IS NOT NULL");
    }
}

