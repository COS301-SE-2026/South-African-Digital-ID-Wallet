namespace Application.Features.Onboarding.Dtos;

public class OnboardCitizenRequest
{
    public string SaId { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool ConsentGiven { get; set; }
}