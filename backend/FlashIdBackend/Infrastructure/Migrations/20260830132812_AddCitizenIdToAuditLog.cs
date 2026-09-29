using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCitizenIdToAuditLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CitizenId",
                table: "AuditLogs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_CitizenId",
                table: "AuditLogs",
                column: "CitizenId");

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_Citizens_CitizenId",
                table: "AuditLogs",
                column: "CitizenId",
                principalTable: "Citizens",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AuditLogs_Citizens_CitizenId",
                table: "AuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_CitizenId",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "CitizenId",
                table: "AuditLogs");
        }
    }
}
