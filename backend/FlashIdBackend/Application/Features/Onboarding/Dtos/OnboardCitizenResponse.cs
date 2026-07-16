namespace Application.Features.Onboarding.Dtos;

public class OnboardCitizenResponse
{
    public Guid CitizenId { get; set; }
    public string SaId { get; set; } = string.Empty;
    public string ActivationPin { get; set; } = string.Empty;
    public DateTime ActivationExpiresAt { get; set; }
    public string Status { get; set; } = "Pending";
}