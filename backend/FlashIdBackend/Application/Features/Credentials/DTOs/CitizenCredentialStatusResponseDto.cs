public class ExistingCredentialSummaryDto
{
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
}

public class CitizenCredentialStatusResponseDto
{
    public string SaId { get; set; } = string.Empty;
    public string Names { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? ActivatedAt { get; set; }
    public string? PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public List<ExistingCredentialSummaryDto> Existing { get; set; } = [];
}