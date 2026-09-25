namespace Application.Features.Credentials.DTOs;

public sealed record RevocationListResponseDto(string RevocationList, DateTimeOffset RetrievedAt);
