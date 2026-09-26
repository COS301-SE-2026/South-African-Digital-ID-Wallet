using Domain.Entities;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IDisclosedFieldsValueResolver
{
    Task<Dictionary<string, string>> ResolveAsync(Credential cred, IEnumerable<string> disclosedFields);
    // no storage calls, no network. Lets offline package builder read the same field definition as the online w/o being handed as SAS URL that can't be used.
    DisclosedFieldSource Describe(Credential credential, string field);
}