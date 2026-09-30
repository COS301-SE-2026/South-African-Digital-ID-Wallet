using Application.Common.Validation;

namespace tests;

public class SaIdValidatorTests
{
    [Theory]
    [InlineData("8001015009087")]
    [InlineData("9912310123184")]
    [InlineData("0002295009084")]
    [InlineData(" 8001015009087 ")]
    public void IsValid_WellFormedId_ReturnsTrue(string saId)
    {
        Assert.True(SaIdValidator.IsValid(saId));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("800101500908")]
    [InlineData("80010150090870")]
    [InlineData("80010150090A7")]
    [InlineData("８００１０１５００９０８７")]
    [InlineData("8013015009082")]
    [InlineData("0102295009082")]
    [InlineData("8001015009285")]
    [InlineData("8001015009088")]
    public void IsValid_MalformedId_ReturnsFalse(string? saId)
    {
        Assert.False(SaIdValidator.IsValid(saId));
    }
}
