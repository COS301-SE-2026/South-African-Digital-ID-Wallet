using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class CredentialsConfigurations: IEntityTypeConfiguration<Credential>
{
    public void Configure(EntityTypeBuilder<Credential> builder)
    {
        builder.ToTable("Credentials");
        
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Signature)
            .IsRequired();

        builder.Property(c => c.IssuedBy)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.Property(c => c.IssueDate)
            .IsRequired();

        builder.HasOne(c => c.Citizen)
            .WithMany(c => c.Credentials)
            .HasForeignKey(c => c.CitizenId);
    }
}