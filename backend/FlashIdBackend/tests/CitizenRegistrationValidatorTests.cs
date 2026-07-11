using Application.Common.Validation;
using Application.Features.Citizens.DTOs;
using Application.Features.Citizens.Exceptions;

namespace tests;

public class CitizenRegistrationValidatorTests
{
    // mock data
    private static RegisterCitizenRequestDto ValidRequest() => new()
    {
        Email = "natethebait@gmail.com",
        Password = "P@ssword123"  // NOSONAR - test credential, not a real secret
    };

    // sends valid request through the validator, checks that no exception was thrown at all
    [Fact]
    public void Validate_ValidRequest_DoesNotThrow()
    {
        var ex = Record.Exception(() => CitizenRegistrationValidator.Validate(ValidRequest())); //xUnit helper, returns null for no errors, so assert expects null
        Assert.Null(ex);
    }

    // test empty email
    [Fact]
    public void Validate_EmailEmpty_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Email = "";

        var ex = Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));

        Assert.Contains("Email", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    // test email white space
    [Fact]
    public void Validate_EmailWhitespace_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Email = "    ";

        Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));
    }

    // test invalid email format
    [Fact]
    public void Validate_EmailInvalidFormat_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Email = "invalid-email";

        var ex = Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));

        Assert.Contains("email", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    // test email missing '@'
    [Fact]
    public void Validate_EmailMissingAtSign_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Email = "examplegmail.com";

        Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));
    }

    // test empty password
    [Fact]
    public void Validate_PasswordEmpty_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Password = "";

        var ex = Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));

        Assert.Contains("Password", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    // password is only 7 chars, checks that the validator rejects passwords shorter than 10, mentions "10" in the message
    [Fact]
    public void Validate_PasswordTooShort_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Password = "Short@1";   // only 7 chars

        var ex = Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));

        Assert.Contains("10", ex.Message);
    }

    // password has no uppercase letter, checks that the validator enforces the uppercase requirement
    [Fact]
    public void Validate_PasswordNoUppercase_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Password = "nouppercase@1";

        Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));
    }

    // password has no lowercase letter, checks that the validator enforces the lowercase requirement
    [Fact]
    public void Validate_PasswordNoLowercase_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Password = "NOLOWERCASE@1";

        Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));
    }

    // password has no digit, checks that the validator enforces the digit requirement
    [Fact]
    public void Validate_PasswordNoDigit_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Password = "NoDigitHere@";

        Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));
    }

    // password has no special character, checks that the validator enforces the special character requirement
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
