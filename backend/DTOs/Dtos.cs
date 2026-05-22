using System.ComponentModel.DataAnnotations;

namespace TeamPulse.API.DTOs;

// ── Request ──────────────────────────────────────────
public record CreateLeaveRequest
{
    [Required]
    [MaxLength(150)]
    public string Emp { get; init; } = string.Empty;

    [Required]
    [RegularExpression("^(planned|sick|wfh|holiday|personal)$",
        ErrorMessage = "Type must be: planned, sick, wfh, holiday, or personal")]
    public string Type { get; init; } = string.Empty;

    [Required]
    public DateOnly FromDate { get; init; }

    [Required]
    public DateOnly ToDate { get; init; }

    [MaxLength(500)]
    public string? Note { get; init; }
}

// ── Responses ─────────────────────────────────────────
public record LeaveResponse(
    Guid     Id,
    string   Emp,
    string   Type,
    DateOnly FromDate,
    DateOnly ToDate,
    string   Note,
    int      DayCount,
    DateTime CreatedAt
);

public record ApiResponse<T>(bool Success, T? Data, string? Error = null);

public record HealthResponse(
    string   Status,
    string   Version,
    string   Environment,
    string   DbStatus,
    DateTime Timestamp
);
