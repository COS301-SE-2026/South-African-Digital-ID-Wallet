using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.EventType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(a => a.Details)
            .IsRequired();

        builder.Property(a => a.IpAddress)
            .IsRequired()
            .HasMaxLength(45);

        builder.Property(a => a.CreatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.Property(a => a.ActorId)
            .IsRequired();

        builder.HasOne(a => a.Actor)
            .WithMany(u => u.AuditLogs)
            .HasForeignKey(a => a.ActorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(a => a.ActorId);

        builder.HasIndex(a => a.EventType);

        builder.HasIndex(a => a.CreatedAt);

        builder.HasIndex(a => new { a.ActorId, a.CreatedAt });

        builder.HasIndex(a => new { a.EventType, a.CreatedAt });

        //for soft deletion
        builder.HasQueryFilter(a => !a.Actor.IsDeleted);
    }
}
