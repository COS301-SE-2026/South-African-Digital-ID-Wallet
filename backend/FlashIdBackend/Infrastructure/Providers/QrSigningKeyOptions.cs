namespace Infrastructure.Providers;

public class QrSigningKeyOptions
{
    public string Kid { get; set; } = string.Empty;
    public string PrivateKey { get; set; } = string.Empty;
    public string Status { get; set; } = "Retired";
}