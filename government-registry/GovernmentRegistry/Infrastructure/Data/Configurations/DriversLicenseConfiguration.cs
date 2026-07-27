using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class DriversLicenseConfigurations : IEntityTypeConfiguration<DriversLicense>
{
    public void Configure(EntityTypeBuilder<DriversLicense> builder)
    {
        builder.ToTable("DriversLicenses");

        builder.HasIndex(d => d.LicenseNumber)
            .IsUnique();

        builder.Property(d => d.LicenseNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(d => d.LicenseCode).IsRequired().HasConversion<string>(); ;

        builder.Property(d => d.Restrictions).HasMaxLength(250);

        builder.Property(d => d.ExpiryDate).IsRequired();

        builder.Property(i => i.PhotoBlob).IsRequired();

    }
}