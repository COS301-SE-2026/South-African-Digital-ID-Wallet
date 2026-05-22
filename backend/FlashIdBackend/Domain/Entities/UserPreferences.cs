namespace Domain.Entities;

using Domain.Enums;

public class UserPreferences : BaseEntity
{
    public string PreferredName { get; set; } = string.Empty;

    public Theme Theme { get; set; } = Theme.System;

    public bool PreferredDisclosure { get; set; }

    // navigation property back to User
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}