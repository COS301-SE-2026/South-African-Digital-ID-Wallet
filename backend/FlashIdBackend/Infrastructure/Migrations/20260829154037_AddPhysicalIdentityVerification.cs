using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPhysicalIdentityVerification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PhysicalIdentityVerifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ConsentGrantedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SubmittedIdNumberHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    OcrIdNumberHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    AzureLivenessSessionId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CardFaceMatchedLiveFace = table.Column<bool>(type: "bit", nullable: true),
                    LivenessPassed = table.Column<bool>(type: "bit", nullable: true),
                    RegistryIdentityMatched = table.Column<bool>(type: "bit", nullable: true),
                    RegistryFaceMatched = table.Column<bool>(type: "bit", nullable: true),
                    VerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FailureReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AttemptCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhysicalIdentityVerifications", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PhysicalIdentityVerifications_AzureLivenessSessionId",
                table: "PhysicalIdentityVerifications",
                column: "AzureLivenessSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_PhysicalIdentityVerifications_UserId",
                table: "PhysicalIdentityVerifications",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PhysicalIdentityVerifications");
        }
    }
}
