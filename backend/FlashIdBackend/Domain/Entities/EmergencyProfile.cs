namespace Domain.Entities;

public class EmergencyProfile : BaseEntity
{
    public Guid CitizenId { get; set; }
    public Citizen Citizen { get; set; } = null!;

    public DateTime? ConsentGivenAt { get; set; }
    public bool IsEnabled { get; set; }

    public string? BloodTypeCipher { get; set; }
    public string? ConditionsCipher { get; set; }
    public string? MedicationCipher { get; set; }
    public string? AllergiesCipher { get; set; }
    public string? ImplantsCipher { get; set; }
    public string? CommunicationNeedsCipher { get; set; }
    public string? MedicalAidSchemeCipher { get; set; }
    public string? MedicalAidNumberCipher { get; set; }

    public string OfflineFieldsJson { get; set; } = "[]";

    public DateTime? MedicalLastUpdatedAt { get; set; }

    public ICollection<EmergencyContact> Contacts { get; set; } = new List<EmergencyContact>();
    public ICollection<EmergencyAccess> Accesses { get; set; } = new List<EmergencyAccess>();
}