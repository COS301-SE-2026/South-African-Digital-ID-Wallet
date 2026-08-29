using Application.Features.Verification.Dtos;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IFaceLivenessService
{
    Task<CreateLivenessSessionResult> CreateLivenessWithVerifySessionAsync(Stream referenceImage, string contentType,
        Guid deviceCorrelationId, CancellationToken cancellationToken);
}