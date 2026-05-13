using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class OfficialConfiguration : IEntityTypeConfiguration<Official>
{
    public void Configure(EntityTypeBuilder<Official> builder)
    {
        builder.HasKey(o => o.Id);

        builder.Property(o => o.OfficialId)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(o => o.CreatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.Property(o => o.UpdatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .ValueGeneratedOnAddOrUpdate();

        builder.Property(o => o.UserId)
            .IsRequired();

        builder.Property(o => o.InstitutionId)
            .IsRequired();

        builder.HasIndex(o => o.OfficialId).IsUnique();
        
        builder.HasOne(o => o.User)
            .WithOne()
            .HasForeignKey<Official>(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(o => o.Institution)
            .WithMany(i => i.Officials)
            .HasForeignKey(o => o.InstitutionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
