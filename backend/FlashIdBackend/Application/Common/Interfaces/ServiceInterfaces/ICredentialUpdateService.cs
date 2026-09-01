using Application.Features.Credentials.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface ICredentialUpdateService
{
    Task<bool> HasCompletedTodayAsync(CancellationToken cancellationToken);
    Task<CredentialUpdateCheckResponseDto> RunUpdateCheckAsync(CancellationToken cancellationToken);
}
