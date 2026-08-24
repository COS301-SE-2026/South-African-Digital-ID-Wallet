using Domain.Enums;

namespace Application.Features.Credentials.DTOs;

public class CredentialExpiryCheckResponseDto
{
    public DateTime RunDate { get; set; }
    public JobRunStatus Status { get; set; }
    public int ProcessedCount { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }

    public bool Failed => Status == JobRunStatus.Failed;
}
