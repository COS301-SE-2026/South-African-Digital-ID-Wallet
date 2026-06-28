using System.Runtime.InteropServices.JavaScript;
using Domain.Enums;
namespace Domain.Entities;

public class CitizenRecord
{
    public Guid Id { get; set; }
    
    public string SaId  { get; set; } = string.Empty;
    
    public string Names { get; set; } = string.Empty;
    
    public string Surname { get; set; } = string.Empty;
    
    public Gender Gender { get; set; }
    
    public DateOnly DateOfBirth { get; set; }
    
    public ICollection<Credential> Credentials { get; set; } = [];
    
}