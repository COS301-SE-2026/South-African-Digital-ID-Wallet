using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUsernameUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DomainUsers_Username",
                table: "DomainUsers");

            migrationBuilder.CreateIndex(
                name: "IX_DomainUsers_Username",
                table: "DomainUsers",
                column: "Username");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DomainUsers_Username",
                table: "DomainUsers");

            migrationBuilder.CreateIndex(
                name: "IX_DomainUsers_Username",
                table: "DomainUsers",
                column: "Username",
                unique: true);
        }
    }
}
