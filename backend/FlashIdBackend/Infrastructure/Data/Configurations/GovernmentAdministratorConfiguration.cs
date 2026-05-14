using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class GovernmentAdministratorConfiguration : IEntityTypeConfiguration<GovernmentAdministrator>
{
    public void Configure(EntityTypeBuilder<GovernmentAdministrator> builder)
    {
        builder.HasKey(g => g.Id);

        builder.Property(g => g.GovernmentId)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(g => g.CreatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.Property(g => g.UpdatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAddOrUpdate();

        builder.Property(g => g.UserId)
            .IsRequired();

        builder.HasIndex(g => g.GovernmentId).IsUnique();
        builder.HasIndex(g => g.UserId).IsUnique();

        builder.HasOne(g => g.User)
            .WithOne()
            .HasForeignKey<GovernmentAdministrator>(g => g.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(g => g.RegisteredInstitutions)
            .WithOne(i => i.RegisteredBy)
            .HasForeignKey(i => i.RegisteredById)
            .OnDelete(DeleteBehavior.Restrict);
    }
}