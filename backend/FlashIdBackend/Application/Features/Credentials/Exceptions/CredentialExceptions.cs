namespace Application.Features.Credentials.Exceptions;

public class MissingMandatoryFieldsException : Exception
{
    public MissingMandatoryFieldsException(IEnumerable<string> missingKeys) : base($"The following mandatory fields must be included: {string.Join(", ", missingKeys)}.") { }
}