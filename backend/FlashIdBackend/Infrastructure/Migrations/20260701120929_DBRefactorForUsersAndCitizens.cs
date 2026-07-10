using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DBRefactorForUsersAndCitizens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DomainUsers_Username",
                table: "DomainUsers");

            migrationBuilder.DropColumn(
                name: "Names",
                table: "DomainUsers");

            migrationBuilder.DropColumn(
                name: "Surname",
                table: "DomainUsers");

            migrationBuilder.DropColumn(
                name: "Username",
                table: "DomainUsers");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "Credentials");

            migrationBuilder.DropColumn(
                name: "IsActivated",
                table: "Citizens");

            migrationBuilder.AddColumn<string>(
                name: "Names",
                table: "Officials",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Surname",
                table: "Officials",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Names",
                table: "GovernmentAdministrators",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Surname",
                table: "GovernmentAdministrators",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "ActivationCode",
                table: "Citizens",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(256)",
                oldMaxLength: 256);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "Citizens",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

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
                name: "Names",
                table: "Citizens",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SelfieImagePath",
                table: "Citizens",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Citizens",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Pending");

            migrationBuilder.AddColumn<string>(
                name: "Surname",
                table: "Citizens",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Names",
                table: "Officials");

            migrationBuilder.DropColumn(
                name: "Surname",
                table: "Officials");

            migrationBuilder.DropColumn(
                name: "Names",
                table: "GovernmentAdministrators");

            migrationBuilder.DropColumn(
                name: "Surname",
                table: "GovernmentAdministrators");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "Citizens");

            migrationBuilder.DropColumn(
                name: "IdBackImagePath",
                table: "Citizens");

            migrationBuilder.DropColumn(
                name: "IdFrontImagePath",
                table: "Citizens");

            migrationBuilder.DropColumn(
                name: "Names",
                table: "Citizens");

            migrationBuilder.DropColumn(
                name: "SelfieImagePath",
                table: "Citizens");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Citizens");

            migrationBuilder.DropColumn(
                name: "Surname",
                table: "Citizens");

            migrationBuilder.AddColumn<string>(
                name: "Names",
                table: "DomainUsers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Surname",
                table: "DomainUsers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Username",
                table: "DomainUsers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "Credentials",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AlterColumn<string>(
                name: "ActivationCode",
                table: "Citizens",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActivated",
                table: "Citizens",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_DomainUsers_Username",
                table: "DomainUsers",
                column: "Username");
        }
    }
}
