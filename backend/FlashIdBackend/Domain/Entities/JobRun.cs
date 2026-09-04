using Domain.Enums;

namespace Domain.Entities;

public class JobRun : BaseEntity
{
    public string JobName { get; set; } = string.Empty;
    public DateTime RunDate { get; set; }
    public JobRunStatus Status { get; set; } = JobRunStatus.Running;
    public DateTime? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }
    public int ProcessedCount { get; set; }
}