namespace Application.Features.Emergency.DTOs;

public record ResolveEmergencyRequestDto
{
    public string Code { get; init; } = string.Empty;
    public string Justification { get; init; } = string.Empty;
    public double? Latitude { get; init; }
    public double? Longitude { get; init; }
    public bool WasOffline { get; init; }
}

public record RegisterEmergencyDeviceRequestDto
{
    public string PublicKeySpki { get; init; } = string.Empty;
    public string Platform { get; init; } = "android";
    public string? DeviceLabel { get; init; }
    public bool IsStrongBoxBacked { get; init; }
}

public record RegisterEmergencyDeviceResponseDto
{
    public string Handle { get; init; } = string.Empty;
}

public record EmergencyContactDto
{
    public string Name { get; init; } = string.Empty;
    public string Relationship { get; init; } = string.Empty;
    public string? Email { get; init; }
    public string? Phone { get; init; }
    public int Priority { get; init; }
}

public record SaveEmergencyProfileRequestDto
{
    public bool IsEnabled { get; init; }
    public bool ConsentGiven { get; init; }
    public Dictionary<string, string> Fields { get; init; } = new();
    public List<string> OfflineFields { get; init; } = new();
    public List<EmergencyContactDto> Contacts { get; init; } = new();
}

public record EmergencyProfileDto
{
    public bool IsEnabled { get; init; }
    public DateTime? ConsentGivenAt { get; init; }
    public Dictionary<string, string> Fields { get; init; } = new();
    public List<string> OfflineFields { get; init; } = new();
    public List<EmergencyContactDto> Contacts { get; init; } = new();
    public DateTime? MedicalLastUpdatedAt { get; init; }
}

public record EmergencyIdentityDto
{
    public string Names { get; init; } = string.Empty;
    public string Surname { get; init; } = string.Empty;
    public DateTime DateOfBirth { get; init; }
    public string? PhotoUrl { get; init; }
}

public record EmergencyMedicalFieldDto
{
    public string Key { get; init; } = string.Empty;
    public string Label { get; init; } = string.Empty;
    public string Value { get; init; } = string.Empty;
}

public record EmergencyProfileResponseDto
{
    public EmergencyIdentityDto Identity { get; init; } = new();
    public List<EmergencyMedicalFieldDto> Medical { get; init; } = new();
    public List<EmergencyContactDto> Contacts { get; init; } = new();
    public DateTime? MedicalLastUpdatedAt { get; init; }
    public DateTime AccessedAt { get; init; }
}

public record OfflineCredentialResponseDto
{
    public string Payload { get; init; } = string.Empty;
    public string Signature { get; init; } = string.Empty;
    public DateTime ExpiresAt { get; init; }
}

public record EmergencyAccessDto
{
    public DateTime AccessedAt { get; init; }
    public string ResponderName { get; init; } = string.Empty;
    public string? InstitutionName { get; init; }
    public string Justification { get; init; } = string.Empty;
    public double? Latitude { get; init; }
    public double? Longitude { get; init; }
    public bool WasOffline { get; init; }
}