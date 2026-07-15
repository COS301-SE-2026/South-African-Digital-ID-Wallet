namespace Infrastructure.Services.GovernmentRegistry.Dtos;

public class GovernmentRegistryCitizenRecordDto
{
    public string SaId { get; set; } = string.Empty;

    public string Names { get; set; } = string.Empty;

    public string Surname { get; set; } = string.Empty;

    public string Gender { get; set; }

    public DateOnly DateOfBirth { get; set; }
}