using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCertifiedCopyDocumentHashIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_CertifiedCredentialCopies_DocumentHash",
                table: "CertifiedCredentialCopies",
                column: "DocumentHash");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CertifiedCredentialCopies_DocumentHash",
                table: "CertifiedCredentialCopies");
        }
    }
}
