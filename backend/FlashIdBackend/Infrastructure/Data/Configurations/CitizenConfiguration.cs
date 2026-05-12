using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class CitizenConfiguration : IEntityTypeConfiguration<Citizen>
{
    public void Configure(EntityTypeBuilder<Citizen> builder)
    {
        builder.HasKey(c => c.Id);

        builder.HasIndex(c => c.SaId).IsUnique();

        builder.Property(c => c.SaId)
            .IsRequired()
            .HasMaxLength(13)
            .IsUnicode(false);

        builder.Property(c => c.ActivationCode)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(c => c.ActivationCodeExpiresAt)
            .HasColumnType("datetime2");
        
        builder.Property(c => c.IsActivated)
            .IsRequired()
            .HasDefaultValue(false);
        
        builder.Property(c => c.CreatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.Property(c => c.UpdatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAddOrUpdate();
        
        builder.Property(c => c.UserId)
            .IsRequired();

        builder.HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasMany(b => b.Credentials)
            .WithOne(credential => credential.Citizen)
            .HasForeignKey(credential => credential.CitizenId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
