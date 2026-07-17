using Application.Common.Services;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class CitizenConfiguration : IEntityTypeConfiguration<Citizen>
{
    public void Configure(EntityTypeBuilder<Citizen> builder)
    {
        const string dateFormat = "datetime2";

        builder.HasKey(c => c.Id);

        builder.HasIndex(c => c.SaId).IsUnique();

        builder.Property(c => c.SaId)
            .IsRequired()
            .HasMaxLength(13)
            .IsUnicode(false);

        builder.Property(c => c.Names)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(c => c.Surname)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(c => c.DateOfBirth)
            .IsRequired()
            .HasColumnType(dateFormat);

        builder.Property(c => c.Gender)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.ActivatedAt)
            .HasColumnType(dateFormat);

        builder.HasMany(c => c.Activations)
            .WithOne(a => a.Citizen)
            .HasForeignKey(a => a.CitizenId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(c => c.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(CitizenStatus.Pending);

        builder.Property(c => c.CreatedAt)
            .IsRequired()
            .HasColumnType(dateFormat)
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.Property(c => c.UpdatedAt)
            .IsRequired()
            .HasColumnType(dateFormat)
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAddOrUpdate();

        builder.HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasMany(b => b.Credentials)
            .WithOne(credential => credential.Citizen)
            .HasForeignKey(credential => credential.CitizenId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(c => c.User == null || !c.User.IsDeleted);
    }
}
