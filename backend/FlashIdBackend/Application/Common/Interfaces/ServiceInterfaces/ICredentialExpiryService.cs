using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Credentials.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface ICredentialExpiryService
{
    Task<bool> HasCompletedTodayAsync(CancellationToken cancellationToken);
    Task<CredentialExpiryCheckResponseDto> RunExpiryCheckAsync(CancellationToken cancellationToken);
}