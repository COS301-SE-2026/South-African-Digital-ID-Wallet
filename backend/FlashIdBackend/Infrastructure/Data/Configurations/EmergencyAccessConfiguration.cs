using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class EmergencyAccessConfiguration : IEntityTypeConfiguration<EmergencyAccess>
{
    public void Configure(EntityTypeBuilder<EmergencyAccess> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Justification)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(a => a.IpAddress).HasMaxLength(45);

        builder.Property(a => a.AccessedAt)
            .IsRequired()
            .HasColumnType("datetime2");

        builder.HasOne(a => a.ResponderUser)
            .WithMany()
            .HasForeignKey(a => a.ResponderUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Institution)
            .WithMany()
            .HasForeignKey(a => a.InstitutionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(a => a.AccessedAt);

        builder.Property(a => a.ResponderName).IsRequired().HasMaxLength(200);
        builder.Property(a => a.ResponderInstitutionName).HasMaxLength(200);

    }
}
