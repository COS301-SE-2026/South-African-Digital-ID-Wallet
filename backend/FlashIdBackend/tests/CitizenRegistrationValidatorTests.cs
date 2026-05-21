using Application.Common.Validation;
using Application.Features.Citizens.DTOs;
using Application.Features.Citizens.Exceptions;

namespace tests;

public class CitizenRegistrationValidatorTests
{
    // mock data
    private static RegisterCitizenRequestDto ValidRequest() => new()
    {                                      // registration requirements
        SaId = "0001015009087",  // 13 digits
        Username = "testuser",       // 8+ chars
        Password = "SecureP@ss1",   // 10+ chars, upper, lower, digit, special
        ActivationCode = "abc12345",       // non-empty
    };

    // sends valid request through the validator, checks that no exception was thrown at all
    [Fact]
    public void Validate_ValidRequest_DoesNotThrow()
    {
        var ex = Record.Exception(() => CitizenRegistrationValidator.Validate(ValidRequest())); //xUnit helper, returns null for no errors, so assert expects null
        Assert.Null(ex);
    }

    // sets sa id to empty string, checks that correct exception is thrown with a message that contains "SA ID"
    [Fact]
    public void Validate_SaIdEmpty_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.SaId = "";

        var ex = Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));

        Assert.Contains("SA ID", ex.Message);
    }

    // test sa id too short, mentions "13" in the message
    [Fact]
    public void Validate_SaIdTooShort_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.SaId = "123456";

        var ex = Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));

        Assert.Contains("13", ex.Message);
    }

    // sa id is 13 chars but contains letters, checks that the validator rejects non-numeric input
    [Fact]
    public void Validate_SaIdContainsLetters_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.SaId = "00010150090AB";   // 13 chars but not all digits

        Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));
    }

    // username is only 3 chars, checks that the validator rejects usernames shorter than 8, mentions "8" in the message
    [Fact]
    public void Validate_UsernameTooShort_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Username = "abc";   // only 3 chars

        var ex = Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));

        Assert.Contains("8", ex.Message);
    }

    // username contains a space, checks that the validator rejects usernames with whitespace
    [Fact]
    public void Validate_UsernameContainsSpace_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Username = "test user";

        Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));
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

    // activation code is empty, checks that the validator requires a non-empty activation code
    [Fact]
    public void Validate_ActivationCodeEmpty_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.ActivationCode = "";

        var ex = Assert.Throws<InvalidCitizenRegistrationRequestException>(
            () => CitizenRegistrationValidator.Validate(req));

        Assert.Contains("Activation code", ex.Message);
    }
}
