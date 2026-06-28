using Domain.Enums;

namespace Domain.Entities;

public abstract class Credential
{
    public Guid Id { get; set; }

    public string Signature { get; set; } = string.Empty;

    public string IssuedBy { get; set; } = string.Empty;
    
    public Guid CitizenId { get; set; }
    
    public CitizenRecords Citizen { get; set; } = null!;
    
}