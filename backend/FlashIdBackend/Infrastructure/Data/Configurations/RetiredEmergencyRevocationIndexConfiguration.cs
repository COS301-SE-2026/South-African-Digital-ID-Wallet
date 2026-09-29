using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class RetiredEmergencyRevocationIndexConfiguration : IEntityTypeConfiguration<RetiredEmergencyRevocationIndex>
{
    public void Configure(EntityTypeBuilder<RetiredEmergencyRevocationIndex> builder)
    {
        builder.HasKey(r => r.Id);

        builder.HasIndex(r => r.RevocationIndex).IsUnique();

        builder.HasIndex(r => r.EmergencyProfileId);
    }
}
