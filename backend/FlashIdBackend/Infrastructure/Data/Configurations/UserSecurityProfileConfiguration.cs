using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class UserSecurityProfileConfiguration : IEntityTypeConfiguration<UserSecurityProfile>
{
    public void Configure(EntityTypeBuilder<UserSecurityProfile> builder)
    {
        builder.HasKey(p => p.UserId);

        builder.Property(p => p.ImpossibleTravelDetectionEnabled)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(p => p.EnhancedVerificationEnabled)
            .IsRequired()
            .HasDefaultValue(false);

        builder.HasOne(p => p.User)
            .WithOne()
            .HasForeignKey<UserSecurityProfile>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
