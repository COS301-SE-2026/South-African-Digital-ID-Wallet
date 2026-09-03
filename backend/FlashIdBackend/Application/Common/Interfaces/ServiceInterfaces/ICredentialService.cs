using Application.Features.Credentials.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface ICredentialService
{
    Task<IEnumerable<CredentialResponseDto>> GetMyCredentialsAsync(Guid userId);
    Task<RevokeCredentialResponseDto> RevokeCredentialAsync(Guid credentialId, Guid adminUserId, RevokeCredentialRequestDto request, string ipAddress);
    Task<ReinstateCredentialResponseDto> ReinstateCredentialAsync(Guid credentialId, Guid adminUserId, ReinstateCredentialRequestDto request, string ipAddress);
    Task<SearchCitizensResponseDto> SearchCitizensAsync(string? query, int page, int pageSize);
    Task<IEnumerable<CredentialResponseDto>> GetCredentialsForCitizenAsync(Guid citizenId);
}
