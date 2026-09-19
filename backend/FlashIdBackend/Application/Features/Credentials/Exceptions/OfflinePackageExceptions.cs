namespace Application.Features.Credentials.Exceptions;

public class OfflinePackageUnavailableException : Exception
{
    public OfflinePackageUnavailableException(string reason) : base($"The offlinep ackage could not be prepared: {reason}") { }
}

public class OfflinePackageDataMissingException : Exception
{
    public OfflinePackageDataMissingException(string reason) : base($"The offlinep ackage could not be prepared: {reason}") { }
}
