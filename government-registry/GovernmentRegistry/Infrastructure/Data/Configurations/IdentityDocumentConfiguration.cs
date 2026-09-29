using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class IdentityDocumentConfiguration : IEntityTypeConfiguration<IdentityDocument>
{
    public void Configure(EntityTypeBuilder<IdentityDocument> builder)
    {
        builder.ToTable("IdentityDocuments");

        builder.Property(i => i.CountryOfBirth)
            .IsRequired().HasMaxLength(100);

        builder.Property(i => i.CitizenshipStatus)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(i => i.Nationality)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(i => i.PhotoBlob)
            .IsRequired();

    }
}