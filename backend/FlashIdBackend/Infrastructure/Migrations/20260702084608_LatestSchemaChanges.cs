using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LatestSchemaChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "IdentityDocuments");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "DriversLicenses");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "Credentials");

            migrationBuilder.DropColumn(
                name: "IdBackImagePath",
                table: "Citizens");

            migrationBuilder.DropColumn(
                name: "IdFrontImagePath",
                table: "Citizens");

            migrationBuilder.DropColumn(
                name: "SelfieImagePath",
                table: "Citizens");

            migrationBuilder.RenameColumn(
                name: "ActivationCodeExpiresAt",
                table: "Citizens",
                newName: "CredentialActivationCodeExpiresAt");

            migrationBuilder.RenameColumn(
                name: "ActivationCode",
                table: "Citizens",
                newName: "CredentialActivationCode");

            migrationBuilder.AddColumn<string>(
                name: "PhotoPath",
                table: "IdentityDocuments",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PhotoPath",
                table: "DriversLicenses",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "PasswordSet",
                table: "DomainUsers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "IdBackImagePath",
                table: "Credentials",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdFrontImagePath",
                table: "Credentials",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "IssueDate",
                table: "Credentials",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "SelfieImagePath",
                table: "Credentials",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "Citizens",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "Citizens",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PhotoPath",
                table: "IdentityDocuments");

            migrationBuilder.DropColumn(
                name: "PhotoPath",
                table: "DriversLicenses");

            migrationBuilder.DropColumn(
                name: "PasswordSet",
                table: "DomainUsers");

            migrationBuilder.DropColumn(
                name: "IdBackImagePath",
                table: "Credentials");

            migrationBuilder.DropColumn(
                name: "IdFrontImagePath",
                table: "Credentials");

            migrationBuilder.DropColumn(
                name: "IssueDate",
                table: "Credentials");

            migrationBuilder.DropColumn(
                name: "SelfieImagePath",
                table: "Credentials");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "Citizens");

            migrationBuilder.RenameColumn(
                name: "CredentialActivationCodeExpiresAt",
                table: "Citizens",
                newName: "ActivationCodeExpiresAt");

            migrationBuilder.RenameColumn(
                name: "CredentialActivationCode",
                table: "Citizens",
                newName: "ActivationCode");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "IdentityDocuments",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "StartDate",
                table: "DriversLicenses",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "Credentials",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "Citizens",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdBackImagePath",
                table: "Citizens",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdFrontImagePath",
                table: "Citizens",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SelfieImagePath",
                table: "Citizens",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);
        }
    }
}
