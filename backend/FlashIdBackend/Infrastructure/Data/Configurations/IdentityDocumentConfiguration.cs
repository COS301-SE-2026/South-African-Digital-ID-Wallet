using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class IdentityDocumentConfiguration : IEntityTypeConfiguration<IdentityDocument>
{
	public void Configure(EntityTypeBuilder<IdentityDocument> builder)
	{
		builder.HasKey(i => i.Id);

		builder.Property(i => i.Gender)
			.IsRequired()
			.HasMaxLength(20);

		builder.Property(i => i.Citizenship)
			.IsRequired()
			.HasMaxLength(50);

		builder.Property(i => i.DateOfBirth)
			.IsRequired()
			.HasColumnType("datetime2");

		builder.Property(i => i.CreatedAt)
			.IsRequired()
			.HasColumnType("datetime2")
			.HasDefaultValueSql("GETUTCDATE()")
			.ValueGeneratedOnAdd();

		builder.Property(i => i.UpdatedAt)
			.IsRequired()
			.HasColumnType("datetime2")
			.ValueGeneratedOnAddOrUpdate();

		builder.Property(i => i.CredentialId)
			.IsRequired();

		builder.HasIndex(i => i.CredentialId).IsUnique();

		builder.HasOne(i => i.Credential)
			.WithOne(c => c.IdentityDocument)
			.HasForeignKey<IdentityDocument>(i => i.CredentialId)
			.OnDelete(DeleteBehavior.Cascade);
	}
}
