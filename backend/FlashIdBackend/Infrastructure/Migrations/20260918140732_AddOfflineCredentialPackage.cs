using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOfflineCredentialPackage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DisclosureSet",
                table: "Credentials",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HolderKeyThumbprint",
                table: "Credentials",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IssuerSignedCredential",
                table: "Credentials",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PackageExpiresAt",
                table: "Credentials",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RevocationIndex",
                table: "Credentials",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SignedAt",
                table: "Credentials",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SigningKid",
                table: "Credentials",
                type: "nvarchar(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Credentials_RevocationIndex",
                table: "Credentials",
                column: "RevocationIndex",
                unique: true,
                filter: "[RevocationIndex] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Credentials_RevocationIndex",
                table: "Credentials");

            migrationBuilder.DropColumn(
                name: "DisclosureSet",
                table: "Credentials");

            migrationBuilder.DropColumn(
                name: "HolderKeyThumbprint",
                table: "Credentials");

            migrationBuilder.DropColumn(
                name: "IssuerSignedCredential",
                table: "Credentials");

            migrationBuilder.DropColumn(
                name: "PackageExpiresAt",
                table: "Credentials");

            migrationBuilder.DropColumn(
                name: "RevocationIndex",
                table: "Credentials");

            migrationBuilder.DropColumn(
                name: "SignedAt",
                table: "Credentials");

            migrationBuilder.DropColumn(
                name: "SigningKid",
                table: "Credentials");
        }
    }
}
