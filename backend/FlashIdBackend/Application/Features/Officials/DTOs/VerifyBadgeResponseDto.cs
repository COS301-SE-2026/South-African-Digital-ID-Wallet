using Domain.Enums;

namespace Application.Features.Officials.DTOs;

public class VerifyBadgeResponseDto
{
    public string InstitutionName { get; set; } = string.Empty;
    public InstitutionType InstitutionType { get; set; }
    public DisclosurePolicyMode Mode { get; set; }
    public List<string> SuggestedIdentityDocumentFields { get; set; } = new();
    public List<string> SuggestedDriversLicenseFields { get; set; } = new();
}