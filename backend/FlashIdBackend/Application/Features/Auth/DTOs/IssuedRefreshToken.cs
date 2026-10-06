namespace Application.Features.Auth.DTOs;

public record IssuedRefreshToken(string Token, DateTime ExpiresAt);
