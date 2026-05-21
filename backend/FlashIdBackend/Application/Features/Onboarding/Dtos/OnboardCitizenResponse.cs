namespace Application.Features.Onboarding.Dtos;

public class OnboardCitizenResponse
{
    public Guid CitizenId { get; set; }
    public string SaId { get; set; } = string.Empty;
    public string ActivationCode { get; set; } = string.Empty;
    public DateTime ActivationCodeExpiresAt { get; set; }
    public string Status { get; set; } = "Pending";
}