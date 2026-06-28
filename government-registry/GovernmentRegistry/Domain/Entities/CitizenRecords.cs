using System.Runtime.InteropServices.JavaScript;
using Domain.Enums;
namespace Domain.Entities;

public class CitizenRecords
{
    public Guid Id { get; set; }
    
    public string SaId  { get; set; } = string.Empty;
    
    public string Names { get; set; } = string.Empty;
    
    public string Surname { get; set; } = string.Empty;
    
    public Gender Gender { get; set; }
    
    public DateTime DateOfBirth { get; set; }
    
}