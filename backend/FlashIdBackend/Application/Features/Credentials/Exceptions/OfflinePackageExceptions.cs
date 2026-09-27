namespace Application.Features.Credentials.Exceptions;

// Something transient stopped the package being prepared, so the wallet should retry later (503).
public class OfflinePackageUnavailableException : Exception
{
    public OfflinePackageUnavailableException(string reason, Exception? innerException = null)
        : base($"The offline package could not be prepared: {reason}", innerException) { }
}

// The credential itself cannot produce a valid presentation, so retrying will not help (409).
public class OfflinePackageDataMissingException : Exception
{
    public OfflinePackageDataMissingException(string claimName, Exception? innerException = null)
        : base($"The offline package could not be prepared: required claim '{claimName}' has no usable value.", innerException) { }
}

// The document behind the credential has expired, so no package can be issued for it (409).
public class OfflinePackageDocumentExpiredException : Exception
{
    public OfflinePackageDocumentExpiredException()
        : base("The offline package could not be prepared: the document has already expired.") { }
}

// The wallet sent a device key that is not a usable P-256 public key, so nothing can be bound to it
public class InvalidDeviceKeyException : Exception
{
    public InvalidDeviceKeyException(string reason, Exception? innerException = null)
        : base($"The device key is not a valid: {reason}", innerException) { }
}

// Another upload of the same scans was stored first, so this one wrote nothing and should be retried (409).
public class OfflineVerificationConflictException : Exception
{
    public OfflineVerificationConflictException()
        : base("These offline verifications were being recorded by another request. Retry the upload.") { }
}

