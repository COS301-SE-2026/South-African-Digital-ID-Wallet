using Domain.Entities;
using Microsoft.Build.Framework;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class PhysicalIdentityVerificationConfiguration
    : IEntityTypeConfiguration<PhysicalIdentityVerification>
{
    public void Configure(EntityTypeBuilder<PhysicalIdentityVerification> builder)
    {
        builder.ToTable("PhysicalIdentityVerifications");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.UserId).IsRequired();
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(x => x.ExpiresAt).IsRequired();
        builder.Property(x => x.ConsentGrantedAt);
        builder.Property(x => x.SubmittedIdNumberHash).HasMaxLength(64);
        builder.Property(x => x.OcrIdNumberHash).HasMaxLength(64);
        builder.Property(x => x.AzureLivenessSessionId).HasMaxLength(200);
        builder.Property(x => x.CardFaceMatchedLiveFace);
        builder.Property(x => x.LivenessPassed);
        builder.Property(x => x.RegistryIdentityMatched);
        builder.Property(x => x.RegistryFaceMatched);
        builder.Property(x => x.VerifiedAt);
        builder.Property(x => x.FailureReason).HasMaxLength(500);
        builder.Property(x => x.AttemptCount).IsRequired().HasDefaultValue(0);
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.AzureLivenessSessionId);
    }
}