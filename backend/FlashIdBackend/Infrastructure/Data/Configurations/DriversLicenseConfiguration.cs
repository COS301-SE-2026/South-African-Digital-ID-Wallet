using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class DriversLicenseConfiguration : IEntityTypeConfiguration<DriversLicense>
{
	public void Configure(EntityTypeBuilder<DriversLicense> builder)
	{
		builder.HasKey(d => d.Id);

		builder.Property(d => d.LicenseNumber)
			.IsRequired()
			.HasMaxLength(13);

		builder.Property(d => d.LicenseCode)
			.IsRequired()
			.HasMaxLength(3);

		builder.Property(d => d.Restrictions)
			.IsRequired()
			.HasMaxLength(2);

		builder.Property(d => d.StartDate)
			.IsRequired()
			.HasColumnType("datetime2");

		builder.Property(d => d.ExpiryDate)
			.IsRequired()
			.HasColumnType("datetime2");

		builder.Property(d => d.CreatedAt)
			.IsRequired()
			.HasColumnType("datetime2")
			.HasDefaultValueSql("GETUTCDATE()")
			.ValueGeneratedOnAdd();

		builder.Property(d => d.UpdatedAt)
			.IsRequired()
			.HasColumnType("datetime2")
			.ValueGeneratedOnAddOrUpdate();

		builder.Property(d => d.CredentialId)
			.IsRequired();

		builder.HasIndex(d => d.CredentialId).IsUnique();

		builder.HasOne(d => d.Credential)
			.WithOne(c => c.DriversLicense)
			.HasForeignKey<DriversLicense>(d => d.CredentialId)
			.OnDelete(DeleteBehavior.Cascade);
	}
}
