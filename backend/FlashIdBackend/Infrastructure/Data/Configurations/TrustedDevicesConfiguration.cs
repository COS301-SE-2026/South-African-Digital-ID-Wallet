using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class TrustedDevicesConfiguration : IEntityTypeConfiguration<TrustedDevice>
{
    public void Configure(EntityTypeBuilder<TrustedDevice> builder)
    {
        builder.Property(d => d.DeviceTokenHash)
            .HasMaxLength(64)
            .IsRequired();

        builder.HasIndex(d => d.DeviceTokenHash)
            .IsUnique();

        builder.HasOne(d => d.Citizen)
            .WithMany()
            .HasForeignKey(d => d.CitizenId);
    }
}