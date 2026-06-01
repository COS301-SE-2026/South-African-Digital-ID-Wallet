namespace Application.Features.Onboarding.DTOs;

public class MockIdentityRecordDto
{
    public string SaId { get; set; } = string.Empty;
    public string Names { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Fullname => $"{Names} {Surname}";
    public DateTime DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Nationality { get; set; }


}

