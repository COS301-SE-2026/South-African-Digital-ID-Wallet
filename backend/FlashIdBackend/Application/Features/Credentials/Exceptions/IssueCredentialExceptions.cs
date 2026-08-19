using Application.Features.Credentials.Enums;

namespace Application.Features.Credentials.Exceptions;

public class CitizenNotOnboardedException : Exception
{
    public CitizenNotOnboardedException(string saId) : base($"The citizen with SA ID '{saId}' has not completed onboarding in FlashID.") { }
}

public class CredentialAlreadyIssuedException : Exception
{
    public CredentialAlreadyIssuedException(string saId, CredentialType credentialType) : base($"Citizen '{saId}' already has an active {credentialType} credential.") { }
}

public class GovernmentRegistryRecordNotFoundException : Exception
{
    public GovernmentRegistryRecordNotFoundException(string saId, CredentialType credentialType) : base($"No '{credentialType}' record found at the government registry for SA ID '{saId}'.") { }
}