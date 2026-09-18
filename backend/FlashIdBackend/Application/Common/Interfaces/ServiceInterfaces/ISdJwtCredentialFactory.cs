namespace Application.Common.Interfaces.ServiceInterfaces;

public interface ISdJwtCredentialFactory
{
    // Factory: hides the salting, hashing, shuffling and signing behind one call. The vct decides which 
    // kind of credential this is, so identity documents, licences and emergency profile share it.
    Task<SdJwtCredential> CreateAsync(SdJwtCredentialRequest request, CancellationToken cancellationToken);
}