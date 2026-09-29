using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEmergencyOfflineRevocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RevocationIndex",
                table: "EmergencyProfiles",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "RetiredEmergencyRevocationIndexes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RevocationIndex = table.Column<int>(type: "int", nullable: false),
                    EmergencyProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RetiredAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RetiredEmergencyRevocationIndexes", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EmergencyProfiles_RevocationIndex",
                table: "EmergencyProfiles",
                column: "RevocationIndex",
                unique: true,
                filter: "[RevocationIndex] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_RetiredEmergencyRevocationIndexes_EmergencyProfileId",
                table: "RetiredEmergencyRevocationIndexes",
                column: "EmergencyProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_RetiredEmergencyRevocationIndexes_RevocationIndex",
                table: "RetiredEmergencyRevocationIndexes",
                column: "RevocationIndex",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RetiredEmergencyRevocationIndexes");

            migrationBuilder.DropIndex(
                name: "IX_EmergencyProfiles_RevocationIndex",
                table: "EmergencyProfiles");

            migrationBuilder.DropColumn(
                name: "RevocationIndex",
                table: "EmergencyProfiles");
        }
    }
}
