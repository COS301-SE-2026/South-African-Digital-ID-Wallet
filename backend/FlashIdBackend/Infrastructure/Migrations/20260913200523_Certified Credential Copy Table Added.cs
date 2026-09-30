using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CertifiedCredentialCopyTableAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CertifiedCredentialCopies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CitizenId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CredentialId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VerificationTokenHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    CredentialSnapshotHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    GeneratedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RevokedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CertifiedCredentialCopies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CertifiedCredentialCopies_Credentials_CredentialId",
                        column: x => x.CredentialId,
                        principalTable: "Credentials",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CertifiedCredentialCopies_CitizenId",
                table: "CertifiedCredentialCopies",
                column: "CitizenId");

            migrationBuilder.CreateIndex(
                name: "IX_CertifiedCredentialCopies_CredentialId",
                table: "CertifiedCredentialCopies",
                column: "CredentialId");

            migrationBuilder.CreateIndex(
                name: "IX_CertifiedCredentialCopies_VerificationTokenHash",
                table: "CertifiedCredentialCopies",
                column: "VerificationTokenHash",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CertifiedCredentialCopies");
        }
    }
}
