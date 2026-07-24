using Application.Features.Credentials.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IQrService
{
    Task<GenerateQrResponseDto> GenerateQrAsync(Guid credentialId, Guid requestingUserId, GenerateQrRequestDto request);
    Task<List<CredentialSummaryDto>> GetMyCredentialsAsync(Guid userId);
    Task<ResolveCredentialResponseDto> ResolveAsync(string token, Guid requestingUserId, string ipAddress);
}