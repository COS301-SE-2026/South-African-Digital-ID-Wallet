using Application.Features.Credentials.Dtos;
using Domain.Entities;

namespace Application.Common.Interfaces;

public interface ICredentialsService
{
    Task<IdentityDocumentResponseDto?> GetIdentityDocumentAsync(string saId, CancellationToken cancellationToken);
    Task<DriversLicenseResponseDto?> GetDriversLicenseAsync(string saId, CancellationToken cancellationToken);
}