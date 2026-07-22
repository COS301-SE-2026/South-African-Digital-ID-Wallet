using Application.Common.Interfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Mapping;
using Application.Features.Credentials.Dtos;
using Domain.Entities;
using DriversLicenseResponseDto = Application.Features.Credentials.Dtos.DriversLicenseResponseDto;

namespace Application.Common.Services;

public class CredentialsService:ICredentialsService
{
    
    private readonly ICredentialsRepository _credentialsRepository;

    public CredentialsService(ICredentialsRepository credentialsRepository)
    {
        _credentialsRepository = credentialsRepository;
    }
    public async Task<IdentityDocumentResponseDto?> GetIdentityDocumentAsync(string saId,
        CancellationToken cancellationToken)
    {
        var cleanSaId = saId?.Trim();
        ArgumentException.ThrowIfNullOrWhiteSpace(cleanSaId);
        
        var document = await _credentialsRepository.GetIdentityDocumentBySaIdAsync(cleanSaId,cancellationToken);
        
        if (document is null)
        {
            throw new ArgumentNullException("Identity document not found.");
        }

        var id = new IdentityDocument()
        {
            Id = document.Id,
            Signature = document.Signature,
            IssuedBy = document.IssuedBy,
            IssueDate = document.IssueDate,
            CountryOfBirth = document.CountryOfBirth,
            CitizenshipStatus = document.CitizenshipStatus,
            Nationality = document.Nationality,
            PhotoBlob = document.PhotoBlob,
        };

        var mapper = new IdentityDocumentMapper();
        return mapper.ToResponse(id);
    }

    public async Task<DriversLicenseResponseDto?> GetDriversLicenseAsync(string saId, CancellationToken cancellationToken)
    {
        var cleanSaId = saId?.Trim();
        ArgumentException.ThrowIfNullOrWhiteSpace(cleanSaId);
        
        var document = await _credentialsRepository.GetDriversLicenseBySaIdAsync(cleanSaId,cancellationToken);
        
        if (document is null)
        {
            throw new ArgumentNullException("Driver's License not found.");
        }

        var driversLicense = new DriversLicense()
        {
            Id = document.Id,
            Signature = document.Signature,
            IssuedBy = document.IssuedBy,
            IssueDate = document.IssueDate,
            LicenseNumber =  document.LicenseNumber,
            LicenseCode = document.LicenseCode,
            Restrictions =  document.Restrictions,
            ExpiryDate =  document.ExpiryDate,
            PhotoBlob = document.PhotoBlob,
        };

        var mapper = new DriversLicenseMapper();
        return mapper.ToResponse(driversLicense);
    }
}