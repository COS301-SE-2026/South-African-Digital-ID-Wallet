using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueActiveSigningKeyPerPurpose : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SigningKeys_Purpose_Status",
                table: "SigningKeys");

            migrationBuilder.CreateIndex(
                name: "IX_SigningKeys_Purpose",
                table: "SigningKeys",
                column: "Purpose",
                unique: true,
                filter: "[Status] = 'Active'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SigningKeys_Purpose",
                table: "SigningKeys");

            migrationBuilder.CreateIndex(
                name: "IX_SigningKeys_Purpose_Status",
                table: "SigningKeys",
                columns: new[] { "Purpose", "Status" });
        }
    }
}
