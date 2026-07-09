using Domain.Entities;

namespace Application.Common.Interfaces.ProviderInterfaces;

public interface IJwtTokenProvider
{
    (string Token, DateTime ExpiresAt) GenerateToken(User user);
}