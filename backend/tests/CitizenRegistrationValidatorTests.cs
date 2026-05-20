using Application.Common.Validation;
using Application.Features.Citizens.DTOs;
using Application.Features.Citizens.Exceptions;

namespace tests;

public class CitizenRegistrationValidatorTests
{
    // mock data
    private static RegisterCitizenRequestDto ValidRequest() => new()
    {                                      // registration requirements
        SaId           = "0001015009087",  // 13 digits
        Username       = "testuser",       // 8+ chars
        Password       = "SecureP@ss1",   // 10+ chars, upper, lower, digit, special
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
}
