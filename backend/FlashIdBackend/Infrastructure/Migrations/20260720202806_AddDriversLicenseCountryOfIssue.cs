using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDriversLicenseCountryOfIssue : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CountryOfIssue",
                table: "DriversLicenses",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "South Africa");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CountryOfIssue",
                table: "DriversLicenses");
        }
    }
}
