using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class DeviceVerificationConfiguration : IEntityTypeConfiguration<DeviceVerification>
{
    public void Configure(EntityTypeBuilder<DeviceVerification> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.OtpHash).IsRequired().HasMaxLength(64);
        builder.Property(x => x.ExpiresAt).IsRequired();
        builder.Property(x => x.AttemptCount).IsRequired();
        builder.Property(x => x.VerifiedAt);
        builder.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.ExpiresAt);
    }
}