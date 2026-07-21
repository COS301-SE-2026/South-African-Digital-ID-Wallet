using System.Text.RegularExpressions;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Verification.Dtos;

namespace Application.Common.Services;

public class CitizenVerificationService : ICitizenVerificationService
{

    private readonly IVerificationRepository _verificationRepository;

    public CitizenVerificationService(IVerificationRepository verificationRepository)
    {
        _verificationRepository = verificationRepository;

    }

    public Task<VerificationResponseDto> VerifyCitizenActivation(VerificationRequestDto request, Guid userId,
        CancellationToken cancellationToken)
    {
        return null;
    }

    private static void ValidateRequest(VerificationRequestDto request)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (string.IsNullOrWhiteSpace(request.Token))
        {
            throw new ArgumentException("Activation token is required");
        }

        if (string.IsNullOrWhiteSpace(request.SaId) || !Regex.IsMatch(request.SaId.Trim(), @"^\d{13}$",
                RegexOptions.None, TimeSpan.FromSeconds(500)))
        {
            throw new ArgumentException("A valid 13-digit South African ID number is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Pin) || !Regex.IsMatch(request.Pin.Trim(), @"^\d{6}$",
                RegexOptions.None, TimeSpan.FromSeconds(500)))
        {
            throw new ArgumentException("A valid 6-digit activation pin is required.");
        }
    }
}