using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    const string DateTime2 = "datetime2";
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(u => u.PhoneNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(u => u.PasswordHash)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(u => u.PasswordSet)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(u => u.FailedLoginAttempts)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(u => u.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(u => u.IsEmailVerified)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(u => u.LockoutUntil)
            .HasColumnType(DateTime2);

        builder.Property(u => u.LastLoginAt)
            .HasColumnType(DateTime2);

        builder.Property(u => u.Role)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(u => u.CreatedAt)
            .IsRequired()
            .HasColumnType(DateTime2)
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.Property(u => u.UpdatedAt)
            .IsRequired()
            .HasColumnType(DateTime2)
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.HasIndex(u => u.Email)
            .IsUnique()
            .HasFilter("[IsDeleted] = 0");

        builder.HasOne(u => u.Preference)
            .WithOne(up => up.User)
            .HasForeignKey<UserPreferences>(up => up.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(u => !u.IsDeleted);

        builder.Property(u => u.EmailOTPHash)
            .HasMaxLength(256);

        builder.Property(u => u.EmailOTPExpiresAt)
            .HasColumnType(DateTime2);

        builder.Property(u => u.OTPAttemptCount)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(u => u.OTPResendCount)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(u => u.PendingEmail)
            .HasMaxLength(256);

        builder.Property(u => u.PasswordReverifiedAt)
            .HasColumnType(DateTime2);
    }
}
