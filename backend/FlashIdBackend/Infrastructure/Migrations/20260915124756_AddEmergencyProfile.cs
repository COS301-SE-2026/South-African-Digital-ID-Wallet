using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEmergencyProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EmergencyDevices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CitizenId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Handle = table.Column<byte[]>(type: "varbinary(16)", nullable: false),
                    PublicKeySpki = table.Column<byte[]>(type: "varbinary(256)", nullable: false),
                    Platform = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    DeviceLabel = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsStrongBoxBacked = table.Column<bool>(type: "bit", nullable: false),
                    RevokedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmergencyDevices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmergencyDevices_Citizens_CitizenId",
                        column: x => x.CitizenId,
                        principalTable: "Citizens",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EmergencyProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CitizenId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConsentGivenAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    BloodTypeCipher = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConditionsCipher = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MedicationCipher = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AllergiesCipher = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImplantsCipher = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CommunicationNeedsCipher = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MedicalAidSchemeCipher = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MedicalAidNumberCipher = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OfflineFieldsJson = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    MedicalLastUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmergencyProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmergencyProfiles_Citizens_CitizenId",
                        column: x => x.CitizenId,
                        principalTable: "Citizens",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EmergencyAccesses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmergencyProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResponderUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResponderName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ResponderInstitutionName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    InstitutionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Justification = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Latitude = table.Column<double>(type: "float", nullable: true),
                    Longitude = table.Column<double>(type: "float", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    WasOffline = table.Column<bool>(type: "bit", nullable: false),
                    AccessedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ContactNotifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmergencyAccesses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmergencyAccesses_DomainUsers_ResponderUserId",
                        column: x => x.ResponderUserId,
                        principalTable: "DomainUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmergencyAccesses_EmergencyProfiles_EmergencyProfileId",
                        column: x => x.EmergencyProfileId,
                        principalTable: "EmergencyProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmergencyAccesses_Institutions_InstitutionId",
                        column: x => x.InstitutionId,
                        principalTable: "Institutions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "EmergencyContacts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmergencyProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Relationship = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmergencyContacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmergencyContacts_EmergencyProfiles_EmergencyProfileId",
                        column: x => x.EmergencyProfileId,
                        principalTable: "EmergencyProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EmergencyAccesses_AccessedAt",
                table: "EmergencyAccesses",
                column: "AccessedAt");

            migrationBuilder.CreateIndex(
                name: "IX_EmergencyAccesses_EmergencyProfileId",
                table: "EmergencyAccesses",
                column: "EmergencyProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_EmergencyAccesses_InstitutionId",
                table: "EmergencyAccesses",
                column: "InstitutionId");

            migrationBuilder.CreateIndex(
                name: "IX_EmergencyAccesses_ResponderUserId",
                table: "EmergencyAccesses",
                column: "ResponderUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EmergencyContacts_EmergencyProfileId",
                table: "EmergencyContacts",
                column: "EmergencyProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_EmergencyDevices_CitizenId",
                table: "EmergencyDevices",
                column: "CitizenId");

            migrationBuilder.CreateIndex(
                name: "IX_EmergencyDevices_Handle",
                table: "EmergencyDevices",
                column: "Handle",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmergencyProfiles_CitizenId",
                table: "EmergencyProfiles",
                column: "CitizenId",
                unique: true);

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmergencyAccesses");

            migrationBuilder.DropTable(
                name: "EmergencyContacts");

            migrationBuilder.DropTable(
                name: "EmergencyDevices");

            migrationBuilder.DropTable(
                name: "EmergencyProfiles");

        }
    }
}
