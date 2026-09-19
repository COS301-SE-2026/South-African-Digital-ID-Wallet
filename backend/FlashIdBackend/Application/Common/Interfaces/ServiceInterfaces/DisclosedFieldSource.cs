namespace Application.Common.Interfaces.ServiceInterfaces;

public enum DisclosedFieldKind
{
    Text,
    Photo,
}

// Where a disclosed field's value comes from, without fetching anything. For Text the value is the value itself.
// For photo it is the blob name, which the caller delivers however it needs to: SAS URL online, actual bytes offline.
public sealed record DisclosedFieldSource(DisclosedFieldKind Kind, string Value)
{
    public static DisclosedFieldSource Text(string? value) => new(DisclosedFieldKind.Text, value ?? string.Empty);
    public static DisclosedFieldSource Photo(string? blobName) => new(DisclosedFieldKind.Photo, blobName ?? string.Empty);
}
