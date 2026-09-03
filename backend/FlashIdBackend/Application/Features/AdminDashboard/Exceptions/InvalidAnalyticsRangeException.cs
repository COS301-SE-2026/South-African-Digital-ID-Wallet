namespace Application.Features.AdminDashboard.Exceptions;

public class InvalidAnalyticsRangeException : Exception
{
    public InvalidAnalyticsRangeException(string? range) : base($"Invalid analytics range '{range}'. Expected one of: 7d, 30d, 90d") { }
}