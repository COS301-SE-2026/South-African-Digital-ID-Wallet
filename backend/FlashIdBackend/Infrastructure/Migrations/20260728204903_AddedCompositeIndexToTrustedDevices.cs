using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddedCompositeIndexToTrustedDevices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TrustedDevices_DeviceTokenHash",
                table: "TrustedDevices");

            migrationBuilder.DropIndex(
                name: "IX_TrustedDevices_UserId",
                table: "TrustedDevices");

            migrationBuilder.CreateIndex(
                name: "IX_TrustedDevices_UserId_DeviceTokenHash",
                table: "TrustedDevices",
                columns: new[] { "UserId", "DeviceTokenHash" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TrustedDevices_UserId_DeviceTokenHash",
                table: "TrustedDevices");

            migrationBuilder.CreateIndex(
                name: "IX_TrustedDevices_DeviceTokenHash",
                table: "TrustedDevices",
                column: "DeviceTokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TrustedDevices_UserId",
                table: "TrustedDevices",
                column: "UserId");
        }
    }
}
