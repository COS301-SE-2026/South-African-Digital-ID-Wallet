namespace Application.Features.GovernmentAdministrators.DTOs;

public class RegisterGovAdminRequestDto
{
    public string GovernmentId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterGovAdminResponseDto
{
    public Guid GovAdminId { get; set; }
    public Guid UserId { get; set; }
    public string GovernmentId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
