using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Added_Citizen_Activation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CredentialActivationCode",
                table: "Citizens");

            migrationBuilder.RenameColumn(
                name: "CredentialActivationCodeExpiresAt",
                table: "Citizens",
                newName: "ActivatedAt");

            migrationBuilder.CreateTable(
                name: "CitizenActivations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CitizenId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TokenHash = table.Column<string>(type: "varchar(64)", unicode: false, maxLength: 64, nullable: false),
                    PinHash = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AttemptCount = table.Column<int>(type: "int", nullable: false),
                    LockedUntil = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RevokedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RevokedReason = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CitizenActivations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CitizenActivations_Citizens_CitizenId",
                        column: x => x.CitizenId,
                        principalTable: "Citizens",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CitizenActivations_CitizenId_Status",
                table: "CitizenActivations",
                columns: new[] { "CitizenId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_CitizenActivations_TokenHash",
                table: "CitizenActivations",
                column: "TokenHash",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CitizenActivations");

            migrationBuilder.RenameColumn(
                name: "ActivatedAt",
                table: "Citizens",
                newName: "CredentialActivationCodeExpiresAt");

            migrationBuilder.AddColumn<string>(
                name: "CredentialActivationCode",
                table: "Citizens",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);
        }
    }
}
