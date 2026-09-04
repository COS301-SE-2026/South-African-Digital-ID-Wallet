namespace Application.Features.GovAdminAuditLog.Exceptions;

public class InvalidAuditActionException : Exception
{
    public InvalidAuditActionException(string action)
        : base($"'{action}' is not a valid audit action.") { }
}