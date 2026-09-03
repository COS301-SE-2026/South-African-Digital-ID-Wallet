namespace Application.Common.Mapping;

public static class SaIdMasker
{
    private const int VisibleSuffixLength = 2;

    public static string Mask(string saId)
    {
        if (string.IsNullOrEmpty(saId)) return saId;

        if (saId.Length <= VisibleSuffixLength) return new string('*', saId.Length);

        var maskedLength = saId.Length - VisibleSuffixLength;

        return new string('*', maskedLength) + saId[^VisibleSuffixLength..];
    }
}