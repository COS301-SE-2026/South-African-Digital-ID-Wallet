using System.Globalization;

namespace Application.Common.Validation;

// Single source of truth for SA ID numbers: YYMMDD SSSS C A Z
public static class SaIdValidator
{
    public static bool IsValid(string? saId)
    {
        if (string.IsNullOrWhiteSpace(saId)) return false;
        var id = saId.Trim();

        if (id.Length != 13 || !id.All(char.IsAsciiDigit)) return false;

        // First six digits must be a real calendar date
        if (!DateTime.TryParseExact(id[..6], "yyMMdd", CultureInfo.InvariantCulture, DateTimeStyles.None, out _))
            return false;

        // 0 = SA citizen, 1 = permanent resident
        if (id[10] is not ('0' or '1')) return false;

        return HasValidLuhnCheckDigit(id);
    }

    // Luhn: double every second digit (odd indexes), subtract 9 if over 9, total must end in 0
    private static bool HasValidLuhnCheckDigit(string id)
    {
        var sum = 0;
        for (var i = 0; i < id.Length; i++)
        {
            var digit = id[i] - '0';
            if (i % 2 == 1)
            {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
        }
        return sum % 10 == 0;
    }
}
