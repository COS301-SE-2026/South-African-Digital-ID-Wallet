using Domain.Enums;

namespace Application.Features.ManageUserAccount.DTOs;

public class ManageUserAccountDto
{
    public string FullName { get; set; } = string.Empty;
    public string IdEnding { get; set; } = string.Empty;
    public string EmailAddress { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;

    public required DateOnly DateOfBirth { get; set; }
    public required DateTime MemberSince { get; set; }
    public DateTime? LastLogin { get; set; }
    public required CitizenStatus AccountStatus { get; set; }
}