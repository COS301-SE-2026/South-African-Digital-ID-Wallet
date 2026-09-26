using Application.Common.Interfaces.ProviderInterfaces;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;

namespace Infrastructure.Providers;

public sealed class ImageSharpPortraitProcessor : IPortraitProcessor
{
    // Recipe C2 from Spike C: 160 px was the smallest size where faces stayed recognisable, and 
    // WebP quality 40 kept 10 test photos between 772 and 4814 bytes (D-018).
    private const int PortraitPixels = 160;
    private const int WebpQuality = 40;
    private readonly PortraitProcessingLimits _limits;

    public ImageSharpPortraitProcessor(PortraitProcessingLimits? limits = null)
    {
        _limits = limits ?? PortraitProcessingLimits.Default;
    }

    public async Task<byte[]> ToOfflinePortraitAsync(Stream source, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(source);

        using var buffered = await ReadWithinLimitAsync(source, cancellationToken);

        // Animated sources are rejected rather than silently using their first frame
        var decoderOptions = new DecoderOptions { MaxFrames = 1 };
        // Identify reads headers only, so it uses default options and still reports every frame.
        var info = await Image.IdentifyAsync(buffered, cancellationToken);

        // An ID photo is a still image. Decoding only the first frame of an animation would hide that
        // something is wrong with the stored file.
        if (info.FrameMetadataCollection.Count > 1)
        {
            throw new InvalidOperationException("Portrait source must be a single still image.");
        }

        if ((long)info.Width * info.Height > _limits.MaxSourcePixels)
        {
            throw new InvalidOperationException($"Portrait source is too large: {info.Width}x{info.Height} pixels.");
        }

        buffered.Position = 0;

        // Belt and braces after the frame check above: never expand more than one frame into memory.
        using var image = await Image.LoadAsync(new DecoderOptions { MaxFrames = 1 }, buffered, cancellationToken);

        image.Mutate(context => context
            // Phone cameras store rotation as an EXIF tag, so without this a portrait photo lands sideways
            .AutoOrient()
            .Resize(new ResizeOptions
            {
                Size = new Size(PortraitPixels, PortraitPixels),
                // Crop keeps the square centre rather than squashing the face to fit
                Mode = ResizeMode.Crop,
                Position = AnchorPositionMode.Center,
                Sampler = KnownResamplers.Bicubic,
            })
        );

        var encoder = new WebpEncoder
        {
            Quality = WebpQuality,
            FileFormat = WebpFileFormatType.Lossy,
            // Drops EXIF, GPS and colour profiles: they would leak where the photo was taken and cost QR frames.
            SkipMetadata = true,
        };

        using var output = new MemoryStream();

        await image.SaveAsync(output, encoder, cancellationToken);

        return output.ToArray();
    }

    private async Task<MemoryStream> ReadWithinLimitAsync(Stream source, CancellationToken cancellationToken)
    {
        var buffer = new MemoryStream();

        try
        {
            var chunk = new byte[81920];
            int read;

            while ((read = await source.ReadAsync(chunk, cancellationToken)) > 0)
            {
                if (buffer.Length + read > _limits.MaxSourceBytes)
                {
                    throw new InvalidOperationException($"Portrait source exceeds {_limits.MaxSourceBytes} bytes.");
                }

                await buffer.WriteAsync(chunk.AsMemory(0, read), cancellationToken);
            }

            buffer.Position = 0;
            return buffer;
        }
        catch
        {
            await buffer.DisposeAsync();
            throw;
        }
    }
}
