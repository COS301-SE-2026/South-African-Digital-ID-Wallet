using Application.Features.Credentials.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface ICredentialService
{
    Task<IEnumerable<CredentialResponseDto>> GetMyCredentialsAsync(Guid userId);
    Task<RevokeCredentialResponseDto> RevokeCredentialAsync(Guid credentialId, Guid adminUserId, RevokeCredentialRequestDto request, string ipAddress);

}
