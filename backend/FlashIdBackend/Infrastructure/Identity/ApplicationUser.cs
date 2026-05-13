using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    // Account lifecycle metadata belongs in the Identity user, not the domain model.
    public bool IsDisabled { get; set; } = false;

    public DateTime? LastLoginUtc { get; set; }

    public DateTime? LastPasswordChangeUtc { get; set; }

    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
}

