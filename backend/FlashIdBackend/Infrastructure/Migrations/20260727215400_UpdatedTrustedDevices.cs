using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedTrustedDevices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TrustedDevices_Citizens_CitizenId",
                table: "TrustedDevices");

            migrationBuilder.DropColumn(
                name: "DeviceName",
                table: "TrustedDevices");

            migrationBuilder.DropColumn(
                name: "IpAddress",
                table: "TrustedDevices");

            migrationBuilder.DropColumn(
                name: "IsCurrentDevice",
                table: "TrustedDevices");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "TrustedDevices");

            migrationBuilder.RenameColumn(
                name: "CitizenId",
                table: "TrustedDevices",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_TrustedDevices_CitizenId",
                table: "TrustedDevices",
                newName: "IX_TrustedDevices_UserId");

            migrationBuilder.AlterColumn<int>(
                name: "DeviceType",
                table: "TrustedDevices",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Browser",
                table: "TrustedDevices",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "DeviceTokenHash",
                table: "TrustedDevices",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LastKnownCity",
                table: "TrustedDevices",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastKnownCountry",
                table: "TrustedDevices",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DeviceVerifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OtpHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AttemptCount = table.Column<int>(type: "int", nullable: false),
                    VerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceVerifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeviceVerifications_DomainUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "DomainUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TrustedDevices_DeviceTokenHash",
                table: "TrustedDevices",
                column: "DeviceTokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeviceVerifications_ExpiresAt",
                table: "DeviceVerifications",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceVerifications_UserId",
                table: "DeviceVerifications",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_TrustedDevices_DomainUsers_UserId",
                table: "TrustedDevices",
                column: "UserId",
                principalTable: "DomainUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TrustedDevices_DomainUsers_UserId",
                table: "TrustedDevices");

            migrationBuilder.DropTable(
                name: "DeviceVerifications");

            migrationBuilder.DropIndex(
                name: "IX_TrustedDevices_DeviceTokenHash",
                table: "TrustedDevices");

            migrationBuilder.DropColumn(
                name: "DeviceTokenHash",
                table: "TrustedDevices");

            migrationBuilder.DropColumn(
                name: "LastKnownCity",
                table: "TrustedDevices");

            migrationBuilder.DropColumn(
                name: "LastKnownCountry",
                table: "TrustedDevices");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "TrustedDevices",
                newName: "CitizenId");

            migrationBuilder.RenameIndex(
                name: "IX_TrustedDevices_UserId",
                table: "TrustedDevices",
                newName: "IX_TrustedDevices_CitizenId");

            migrationBuilder.AlterColumn<string>(
                name: "DeviceType",
                table: "TrustedDevices",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "Browser",
                table: "TrustedDevices",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeviceName",
                table: "TrustedDevices",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "IpAddress",
                table: "TrustedDevices",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsCurrentDevice",
                table: "TrustedDevices",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "TrustedDevices",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_TrustedDevices_Citizens_CitizenId",
                table: "TrustedDevices",
                column: "CitizenId",
                principalTable: "Citizens",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
