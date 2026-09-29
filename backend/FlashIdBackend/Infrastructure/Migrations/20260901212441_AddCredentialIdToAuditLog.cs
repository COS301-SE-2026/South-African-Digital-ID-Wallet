using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCredentialIdToAuditLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CredentialId",
                table: "AuditLogs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_CredentialId",
                table: "AuditLogs",
                column: "CredentialId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_CredentialId_EventType",
                table: "AuditLogs",
                columns: new[] { "CredentialId", "EventType" });

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_Credentials_CredentialId",
                table: "AuditLogs",
                column: "CredentialId",
                principalTable: "Credentials",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AuditLogs_Credentials_CredentialId",
                table: "AuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_CredentialId",
                table: "AuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_CredentialId_EventType",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "CredentialId",
                table: "AuditLogs");
        }
    }
}
