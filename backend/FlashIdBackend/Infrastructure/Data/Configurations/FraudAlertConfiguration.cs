using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class FraudAlertConfiguration : IEntityTypeConfiguration<FraudAlert>
{
    public void Configure(EntityTypeBuilder<FraudAlert> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.RiskLevel)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(10);

        builder.Property(a => a.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(a => a.ResolutionAction)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(a => a.Signals)
            .IsRequired()
            .HasMaxLength(500);

        builder.HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.SecurityEvent)
            .WithMany()
            .HasForeignKey(a => a.SecurityEventId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.PreviousSecurityEvent)
            .WithMany()
            .HasForeignKey(a => a.PreviousSecurityEventId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(a => new { a.UserId, a.Status });
        builder.HasIndex(a => new { a.UserId, a.CreatedAt });
    }
}
