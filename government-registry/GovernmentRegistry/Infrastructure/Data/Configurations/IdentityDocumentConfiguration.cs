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
        
        builder.HasIndex(i => i.IdNumber).IsUnique();
        
        builder.Property(i => i.IdNumber)
            .IsRequired()
            .HasMaxLength(13);

        builder.Property(i => i.Citizenship)
            .IsRequired();
        
        builder.Property(i => i.CountryOfBirth)
            .IsRequired();
        
        builder.Property(i => i.Status)
            .IsRequired()
            .HasConversion<string>();
        
        builder.Property(i => i.Nationality )
            .IsRequired()
            .HasConversion<string>();
        
        builder.Property(i => i.PhotoHash)
            .HasConversion<string>();
        
    }
}