namespace Application.Features.Officials.DTOs;

// Query-string filters for GET /api/officials/history; property names match the query keys
public class OfficialHistoryQueryDto
{
    /// <summary>Free text filter matching action, citizen name, performing official's name, or outcome/type.</summary>
    public string? Search { get; set; }

    /// <summary>Filters to a specific audit event type.</summary>
    public string? Action { get; set; }

    /// <summary>Inclusive lower bound on the entity's timestamp.</summary>
    public DateTime? DateFrom { get; set; }

    /// <summary>Inclusive upper bound on the entity's timestamp.</summary>
    public DateTime? DateTo { get; set; }

    /// <summary>Filters by outcome: "Success" or "Failed".</summary>
    public string? Type { get; set; }

    /// <summary>1-based page number. Clamped server side to >= 1.</summary>
    public int? Page { get; set; }

    /// <summary>Items per page. Clamped server side to [1, 100], default 7.</summary>
    public int? PageSize { get; set; }

    /// <summary>"work" for citizen-facing actions, "security" for account events; omit for everything.</summary>
    public string? Category { get; set; }
}
