using Domain.Entities;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IDisclosedFieldsValueResolver
{
    Task<Dictionary<string, string>> ResolveAsync(Credential cred, IEnumerable<string> disclosedFields);
}