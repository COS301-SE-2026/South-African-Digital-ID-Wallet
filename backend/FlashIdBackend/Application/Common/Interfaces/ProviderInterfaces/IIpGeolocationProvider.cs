using Application.Features.ManageUserAccountCard.DTOs;

namespace Application.Common.Interfaces.ProviderInterfaces;

public interface IIpGeolocationProvider
{
    Task<IpLocationResult?> GetLocationAsync(string ipAddress, CancellationToken cancellationToken);
}