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
    [Theory]
    [InlineData("", "P@ssword123", "Email is required.")]
    [InlineData("invalid-email", "P@ssword123", "Enter a valid email address, for example name@example.com.")]
    [InlineData("citizen@example.com", "", "Password is required.")]
    [InlineData("citizen@example.com", "Sh0rt!", "Password must be at least 10 characters.")]
    [InlineData("citizen@example.com", "p@ssword123", "Password must contain at least one uppercase letter.")]
    [InlineData("citizen@example.com", "P@SSWORD123", "Password must contain at least one lowercase letter.")]
    [InlineData("citizen@example.com", "P@sswordabc", "Password must contain at least one digit.")]
    [InlineData("citizen@example.com", "Password123", "Password must contain at least one special character (!@#$%^&*_-+=.<>?~).")]
    public void Validate_InvalidInput_ReturnsMessageThatNamesTheProblemAndTheFix(string email, string password, string expectedMessage)
    {
        var request = new RegisterCitizenRequestDto { Email = email, Password = password };

        var ex = Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(request));

        Assert.Equal(expectedMessage, ex.Message);
    }
}
