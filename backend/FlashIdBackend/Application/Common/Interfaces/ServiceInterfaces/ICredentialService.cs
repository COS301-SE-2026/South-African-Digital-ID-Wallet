using Application.Features.Credentials.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface ICredentialService
{
    Task<IEnumerable<CredentialResponseDto>> GetMyCredentialsAsync(Guid userId);
}
