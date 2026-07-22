using Domain.Enums;
using System.Text.Json.Serialization;

namespace Application.Features.Officials.DTOs;

public class VerifyBadgeResponseDto
{
    public string InstitutionName { get; set; } = string.Empty;
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public InstitutionType InstitutionType { get; set; }
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public DisclosurePolicyMode Mode { get; set; }
    public List<string> SuggestedIdentityDocumentFields { get; set; } = new();
    public List<string> SuggestedDriversLicenseFields { get; set; } = new();
}