namespace Application.Common.Interfaces.ProviderInterfaces;

// Caps on what a source photo may be before it is decoded. A decoder turns a small compressed file
// into a large bitmap in memory, so an unchecked image is a denial of service risk.
public sealed record PortraitProcessingLimits(int MaxSourceBytes = 20 * 1024 * 1024, long MaxSourcePixels = 50_000_000)
{
    public static readonly PortraitProcessingLimits Default = new();
}
