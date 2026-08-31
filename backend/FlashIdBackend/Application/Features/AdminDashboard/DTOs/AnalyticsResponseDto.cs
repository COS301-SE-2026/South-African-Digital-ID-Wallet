namespace Application.Features.AdminDashboard.DTOs;

public class AnalyticsResponseDto
{
    public MetricDto Verifications { get; set; } = new();
    public MetricDto CredentialsIssued { get; set; } = new();
    public MetricDto ActiveOfficials { get; set; } = new();
    public MetricDto ActiveInstitutions { get; set; } = new();
}