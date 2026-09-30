using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddImpossibleTravelFraudDetection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SecurityEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    OccurredAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: false),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Latitude = table.Column<double>(type: "float", nullable: true),
                    Longitude = table.Column<double>(type: "float", nullable: true),
                    DeviceTokenHash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    DeviceDescription = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsTrustedDevice = table.Column<bool>(type: "bit", nullable: false),
                    IsNewDevice = table.Column<bool>(type: "bit", nullable: false),
                    RiskScore = table.Column<int>(type: "int", nullable: false),
                    RiskLevel = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecurityEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SecurityEvents_DomainUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "DomainUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserSecurityProfiles",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ImpossibleTravelDetectionEnabled = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    EnhancedVerificationEnabled = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    QrRestrictedUntil = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSecurityProfiles", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserSecurityProfiles_DomainUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "DomainUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FraudAlerts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SecurityEventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PreviousSecurityEventId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RiskScore = table.Column<int>(type: "int", nullable: false),
                    RiskLevel = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Signals = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsImpossibleTravel = table.Column<bool>(type: "bit", nullable: false),
                    DistanceKm = table.Column<double>(type: "float", nullable: true),
                    ElapsedMinutes = table.Column<double>(type: "float", nullable: true),
                    ImpliedSpeedKmh = table.Column<double>(type: "float", nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResolutionAction = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FraudAlerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FraudAlerts_DomainUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "DomainUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FraudAlerts_SecurityEvents_PreviousSecurityEventId",
                        column: x => x.PreviousSecurityEventId,
                        principalTable: "SecurityEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FraudAlerts_SecurityEvents_SecurityEventId",
                        column: x => x.SecurityEventId,
                        principalTable: "SecurityEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FraudAlerts_PreviousSecurityEventId",
                table: "FraudAlerts",
                column: "PreviousSecurityEventId");

            migrationBuilder.CreateIndex(
                name: "IX_FraudAlerts_SecurityEventId",
                table: "FraudAlerts",
                column: "SecurityEventId");

            migrationBuilder.CreateIndex(
                name: "IX_FraudAlerts_UserId_CreatedAt",
                table: "FraudAlerts",
                columns: new[] { "UserId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_FraudAlerts_UserId_Status",
                table: "FraudAlerts",
                columns: new[] { "UserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_SecurityEvents_UserId_DeviceTokenHash",
                table: "SecurityEvents",
                columns: new[] { "UserId", "DeviceTokenHash" });

            migrationBuilder.CreateIndex(
                name: "IX_SecurityEvents_UserId_OccurredAt",
                table: "SecurityEvents",
                columns: new[] { "UserId", "OccurredAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FraudAlerts");

            migrationBuilder.DropTable(
                name: "UserSecurityProfiles");

            migrationBuilder.DropTable(
                name: "SecurityEvents");
        }
    }
}
