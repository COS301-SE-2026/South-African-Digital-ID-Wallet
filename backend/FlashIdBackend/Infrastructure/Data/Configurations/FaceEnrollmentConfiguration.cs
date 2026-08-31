using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class FaceEnrollmentConfiguration : IEntityTypeConfiguration<FaceEnrollment>
{
    public void Configure(EntityTypeBuilder<FaceEnrollment> builder)
    {
        builder.HasKey(f => f.Id);
        builder.Property(f => f.Status).IsRequired().HasConversion<int>();
        builder.Property(f => f.PendingSessionId).HasMaxLength(128);
        builder.Property(f => f.SessionStartedAt).HasColumnType("datetime2");
        builder.Property(f => f.EnrolledAt).HasColumnType("datetime2");
        builder.Property(f => f.LastVerifiedAt).HasColumnType("datetime2");
        builder.Property(f => f.LockedUntil).HasColumnType("datetime2");
        builder.HasOne(f => f.Citizen)
            .WithOne(c => c.FaceEnrollment)
            .HasForeignKey<FaceEnrollment>(f => f.CitizenId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(f => f.CitizenId).IsUnique();
    }
}