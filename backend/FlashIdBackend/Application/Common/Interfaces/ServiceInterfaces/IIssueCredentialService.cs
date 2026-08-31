using Application.Features.Credentials.DTOs;
using Domain.Enums;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IIssueCredentialService
{
    Task<CitizenCredentialStatusResponseDto> GetCitizenStatusAsync(string saId, Guid officialId, string ipAddress, CancellationToken cancellationToken);
    Task<CredentialResponseDto> IssueCredentialAsync(IssueCredentialRequestDto request, Guid officialId, string ipAddress, CancellationToken cancellationToken);
}