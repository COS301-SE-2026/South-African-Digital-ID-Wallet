using Application.Common.Mapping;

namespace tests;

public class SaIdMaskerTests
{
    [Fact]
    public void Mask_WithNull_ReturnsNull()
    {
        Assert.Null(SaIdMasker.Mask(null!));
    }

    [Fact]
    public void Mask_WithEmptyString_ReturnsEmptyString()
    {
        Assert.Equal(string.Empty, SaIdMasker.Mask(string.Empty));
    }

    [Theory]
    [InlineData("1", "*")]
    [InlineData("12", "**")]
    public void Mask_WhenNotLongerThanVisibleSuffix_MasksEveryCharacter(string saId, string expected)
    {
        Assert.Equal(expected, SaIdMasker.Mask(saId));
    }

    [Theory]
    [InlineData("123", "*23")]
    [InlineData("9001015800085", "***********85")]
    public void Mask_WithLongerValue_MasksAllButFinalTwoDigits(string saId, string expected)
    {
        Assert.Equal(expected, SaIdMasker.Mask(saId));
    }

    [Fact]
    public void Mask_WithRealisticSaId_PreservesOriginalLength()
    {
        const string saId = "9001015800085";

        var masked = SaIdMasker.Mask(saId);

        Assert.Equal(saId.Length, masked.Length);
        Assert.EndsWith("85", masked);
        Assert.DoesNotContain("9001015800", masked);
    }
}
