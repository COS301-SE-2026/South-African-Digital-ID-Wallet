using Application.Common.Validation;
using Application.Features.Institutions.DTOs;
using Application.Features.Institutions.Exceptions;

namespace tests;

public class InstitutionValidatorTests
{
    private static RegisterInstitutionRequestDto ValidRequest() => new()
    {
        Name = "Home Affairs Johannesburg",
        VerificationNumber = "HA-JHB-2026-001",
        AdminId = Guid.NewGuid(),
    };

    [Fact]
    public void Validate_ValidRequest_DoesNotThrow()
    {
        var ex = Record.Exception(() => InstitutionValidator.Validate(ValidRequest()));
        Assert.Null(ex);
    }

    [Fact]
    public void Validate_NameEmpty_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Name = "";

        var ex = Assert.Throws<InvalidInstitutionRequestException>(
            () => InstitutionValidator.Validate(req));

        Assert.Contains("name", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Validate_NameWhitespace_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Name = "   ";

        Assert.Throws<InvalidInstitutionRequestException>(
            () => InstitutionValidator.Validate(req));
    }

    [Fact]
    public void Validate_NameTooLong_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Name = new string('A', 257);

        var ex = Assert.Throws<InvalidInstitutionRequestException>(
            () => InstitutionValidator.Validate(req));

        Assert.Contains("256", ex.Message);
    }

    [Fact]
    public void Validate_VerificationNumberEmpty_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.VerificationNumber = "";

        var ex = Assert.Throws<InvalidInstitutionRequestException>(
            () => InstitutionValidator.Validate(req));

        Assert.Contains("Verification", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Validate_VerificationNumberWhitespace_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.VerificationNumber = "   ";

        Assert.Throws<InvalidInstitutionRequestException>(
            () => InstitutionValidator.Validate(req));
    }

    [Fact]
    public void Validate_VerificationNumberTooLong_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.VerificationNumber = new string('V', 101);

        var ex = Assert.Throws<InvalidInstitutionRequestException>(
            () => InstitutionValidator.Validate(req));

        Assert.Contains("100", ex.Message);
    }

    [Fact]
    public void Validate_AdminIdEmpty_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.AdminId = Guid.Empty;

        var ex = Assert.Throws<InvalidInstitutionRequestException>(
            () => InstitutionValidator.Validate(req));

        Assert.Contains("admin", ex.Message, StringComparison.OrdinalIgnoreCase);
    }
}