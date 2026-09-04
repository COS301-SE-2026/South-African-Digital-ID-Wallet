namespace Application.Features.Citizens.Dtos;

public class CitizenRecordResponseDto
{
    public string SaId { get; set; } = string.Empty;
    public string Names { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public DateOnly DateOfBirth { get; set; }
    public string? PhotoBlobName { get; set; }
}