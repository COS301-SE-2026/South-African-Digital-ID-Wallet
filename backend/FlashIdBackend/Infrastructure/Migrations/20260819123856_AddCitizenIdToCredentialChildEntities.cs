using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCitizenIdToCredentialChildEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CitizenId",
                table: "IdentityDocuments",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "CitizenId",
                table: "DriversLicenses",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.Sql(@"
                UPDATE id
                SET id.CitizenId = c.CitizenId
                FROM IdentityDocuments id
                INNER JOIN Credentials c ON c.Id = id.CredentialId;
            ");

            migrationBuilder.Sql(@"
                UPDATE dl
                SET dl.CitizenId = c.CitizenId
                FROM DriversLicenses dl
                INNER JOIN Credentials c ON c.Id = dl.CredentialId;
            ");

            migrationBuilder.CreateIndex(
                name: "IX_IdentityDocuments_CitizenId",
                table: "IdentityDocuments",
                column: "CitizenId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DriversLicenses_CitizenId",
                table: "DriversLicenses",
                column: "CitizenId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_IdentityDocuments_CitizenId",
                table: "IdentityDocuments");

            migrationBuilder.DropIndex(
                name: "IX_DriversLicenses_CitizenId",
                table: "DriversLicenses");

            migrationBuilder.DropColumn(
                name: "CitizenId",
                table: "IdentityDocuments");

            migrationBuilder.DropColumn(
                name: "CitizenId",
                table: "DriversLicenses");
        }
    }
}
