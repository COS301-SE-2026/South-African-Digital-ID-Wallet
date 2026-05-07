using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class UserPreferencesConfiguration : IEntityTypeConfiguration<UserPreferences>
{
    public void Configure(EntityTypeBuilder<UserPreferences> builder)
    {
        builder.HasKey(up => up.Id);

        builder.Property(up => up.PreferredName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(up => up.Theme)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(up => up.PreferredDisclosure)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(up => up.CreatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.Property(up => up.UpdatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .ValueGeneratedOnAddOrUpdate();

        builder.Property(up => up.UserId)
            .IsRequired();

        builder.HasIndex(up => up.UserId).IsUnique();
        
        builder.HasOne(up => up.User)
            .WithOne(u => u.Preference)
            .HasForeignKey<UserPreferences>(up => up.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
