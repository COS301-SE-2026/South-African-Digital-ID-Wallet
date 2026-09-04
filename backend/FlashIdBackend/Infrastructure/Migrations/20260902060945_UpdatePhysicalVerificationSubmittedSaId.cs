using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePhysicalVerificationSubmittedSaId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SubmittedIdNumberHash",
                table: "PhysicalIdentityVerifications");

            migrationBuilder.AddColumn<string>(
                name: "SubmittedSaId",
                table: "PhysicalIdentityVerifications",
                type: "nvarchar(13)",
                maxLength: 13,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SubmittedSaId",
                table: "PhysicalIdentityVerifications");

            migrationBuilder.AddColumn<string>(
                name: "SubmittedIdNumberHash",
                table: "PhysicalIdentityVerifications",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);
        }
    }
}
