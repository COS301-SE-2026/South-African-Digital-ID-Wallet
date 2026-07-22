namespace Application.Features.Credentials.Dtos;

public sealed class IdentityDocumentResponseDto
{
    public Guid CredentialId { get; set; }
    public string Signature { get; set; }= string.Empty;
    public string IssuedBy { get; set; }= string.Empty;
    public DateOnly IssueDate { get; set; }
    public string CountryOfBirth { get; set; }= string.Empty;
    public string CitizenshipStatus { get; set; }= string.Empty;
    public string Nationality { get; set; }= string.Empty;
    public string PhotoBlob { get; set; }= string.Empty;
    
}