namespace Application.Features.GovAdminAuditLog.DTOs;

public class GovAdminAuditLogItemDto
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? UserName { get; set; }
    public string? Role { get; set; }
    public string? EntityType { get; set; }
    public string? IpAddress { get; set; }
    public string Outcome { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Device { get; set; }
    public string? Location { get; set; }
    public string? PreviousStatus { get; set; }
    public string? NewStatus { get; set; }
    public string? RevocationReason { get; set; }
}

public class GovAdminAuditLogResponseDto
{
    public List<GovAdminAuditLogItemDto> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
}