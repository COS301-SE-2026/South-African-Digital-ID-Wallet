namespace Application.Features.Verification.Dtos;

public class CreateLivenessSessionResult
{
    public string SessionId { get; init; } = string.Empty;

    public string AuthToken { get; init; } = string.Empty;

    public string? Status { get; init; }
}