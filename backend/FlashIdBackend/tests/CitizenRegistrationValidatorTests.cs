using Application.Common.Validation;
using Application.Features.Citizens.DTOs;
using Application.Features.Citizens.Exceptions;

namespace tests;

public class CitizenRegistrationValidatorTests
{
    private static RegisterCitizenRequestDto ValidRequest() => new()
    {
        Email = "natethebait@gmail.com",
        Password = "P@ssword123"  // NOSONAR - test credential, not a real secret
    };

    [Fact]
    public void Validate_ValidRequest_DoesNotThrow()
    {
        var ex = Record.Exception(() => CitizenRegistrationValidator.Validate(ValidRequest()));
        Assert.Null(ex);
    }

    [Fact]
    public void Validate_EmailEmpty_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Email = "";

        var ex = Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));

        Assert.Contains("Email", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Validate_EmailWhitespace_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Email = "    ";

        Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));
    }

    [Fact]
    public void Validate_EmailInvalidFormat_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Email = "invalid-email";

        var ex = Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));

        Assert.Contains("email", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Validate_EmailMissingAtSign_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Email = "examplegmail.com";

        Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));
    }

    [Fact]
    public void Validate_PasswordEmpty_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Password = "";

        var ex = Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));

        Assert.Contains("Password", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Validate_PasswordTooShort_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Password = "Short@1";

        var ex = Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));

        Assert.Contains("10", ex.Message);
    }

    [Fact]
    public void Validate_PasswordNoUppercase_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Password = "nouppercase@1";

        Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));
    }

    [Fact]
    public void Validate_PasswordNoLowercase_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Password = "NOLOWERCASE@1";

        Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));
    }

    [Fact]
    public void Validate_PasswordNoDigit_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Password = "NoDigitHere@";

        Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));
    }

    [Fact]
    public void Validate_PasswordNoSpecialChar_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Password = "NoSpecialChar1";

        Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));
    }

    [Fact]
    public void Validate_PasswordOnlyAllowedSpecialChars_DoesNotThrow()
    {
        var allowed = new[] { '!', '@', '#', '$', '%', '^', '&', '*', '_', '+', '-', '=', '.', '<', '>', '?', '~' };
        foreach (var character in allowed)
        {
            var req = ValidRequest();
            req.Password = $"Password12{character}";
            var ex = Record.Exception(() => CitizenRegistrationValidator.Validate(req));
            Assert.Null(ex);
        }
    }

    [Fact]
    public void Validate_PasswordWithDisallowedSpecialChar_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Password = "Password(23";

        Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));
    }
}
