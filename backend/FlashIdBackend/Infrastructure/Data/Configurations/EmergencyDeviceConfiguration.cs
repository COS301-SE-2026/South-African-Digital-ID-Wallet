using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class EmergencyDeviceConfiguration : IEntityTypeConfiguration<EmergencyDevice>
{
    public void Configure(EntityTypeBuilder<EmergencyDevice> builder)
    {
        builder.HasKey(d => d.Id);

        builder.Property(d => d.Handle)
            .IsRequired()
            .HasColumnType("varbinary(16)");

        builder.HasIndex(d => d.Handle).IsUnique();

        builder.Property(d => d.PublicKeySpki)
            .IsRequired()
            .HasColumnType("varbinary(256)");

        builder.Property(d => d.Platform)
            .IsRequired()
            .HasMaxLength(16);

        builder.Property(d => d.DeviceLabel)
            .HasMaxLength(100);

        builder.HasOne(d => d.Citizen)
            .WithMany()
            .HasForeignKey(d => d.CitizenId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(d => d.CitizenId);
    }
}
