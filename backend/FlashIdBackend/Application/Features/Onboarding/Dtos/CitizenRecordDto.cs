namespace Application.Features.Onboarding.Dtos;

public class CitizenRecordDto
{
    public string SaId { get; set; } = string.Empty;
    public string Names { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Fullname => $"{Names} {Surname}";
    public DateTime DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Nationality { get; set; }


}

