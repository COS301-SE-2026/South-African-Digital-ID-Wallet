using System.Text;
using Application.Common.Interfaces.ProviderInterfaces;
using Infrastructure.Providers;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;
using SixLabors.ImageSharp.PixelFormats;

namespace tests;

public class ImageSharpPortraitProcessorTests
{
    private const int ExpectedSize = 160;

    private static MemoryStream CreateJpeg(int width, int height, Action<Image<Rgba32>>? configure = null)
    {
        using var image = new Image<Rgba32>(width, height);

        image.ProcessPixelRows(accessor =>
        {
            for (var y = 0; y < accessor.Height; y++)
            {
                var row = accessor.GetRowSpan(y);
                for (var x = 0; x < row.Length; x++)
                {
                    row[x] = new Rgba32(
                        (byte)(x * 255 / Math.Max(1, accessor.Width - 1)),
                        (byte)(y * 255 / Math.Max(1, accessor.Height - 1)),
                        120);
                }
            }
        });

        configure?.Invoke(image);

        var stream = new MemoryStream();
        image.SaveAsJpeg(stream, new JpegEncoder { Quality = 90 });
        stream.Position = 0;

        return stream;
    }

    private static MemoryStream CreateHalvesJpeg(int width, int height, ushort? exifOrientation)
    {
        using var image = new Image<Rgba32>(width, height);

        image.ProcessPixelRows(accessor =>
        {
            for (var y = 0; y < accessor.Height; y++)
            {
                var row = accessor.GetRowSpan(y);
                for (var x = 0; x < row.Length; x++)
                {
                    row[x] = x < accessor.Width / 2 ? new Rgba32(220, 20, 20) : new Rgba32(20, 20, 220);
                }
            }
        });

        if (exifOrientation is { } orientation)
        {
            image.Metadata.ExifProfile = new ExifProfile();
            image.Metadata.ExifProfile.SetValue(ExifTag.Orientation, orientation);
        }

        var stream = new MemoryStream();
        image.SaveAsJpeg(stream, new JpegEncoder { Quality = 95 });
        stream.Position = 0;

        return stream;
    }

    private static ImageSharpPortraitProcessor CreateProcessor(PortraitProcessingLimits? limits = null) => new(limits);

    [Theory]
    [InlineData(600, 800)]
    [InlineData(800, 600)]
    [InlineData(160, 160)]
    [InlineData(80, 120)]
    public async Task ToOfflinePortraitAsync_AnySourceShape_ReturnsA160By160Image(int width, int height)
    {
        using var source = CreateJpeg(width, height);

        var result = await CreateProcessor().ToOfflinePortraitAsync(source, TestContext.Current.CancellationToken);

        var info = Image.Identify(result);

        Assert.Equal(ExpectedSize, info.Width);
        Assert.Equal(ExpectedSize, info.Height);
    }

    [Fact]
    public async Task ToOfflinePortraitAsync_AnySource_ReturnsWebpBytes()
    {
        using var source = CreateJpeg(600, 800);

        var result = await CreateProcessor().ToOfflinePortraitAsync(source, TestContext.Current.CancellationToken);

        // A WebP file starts with "RIFF", then four length bytes, then "WEBP".
        Assert.Equal("RIFF", Encoding.ASCII.GetString(result, 0, 4));
        Assert.Equal("WEBP", Encoding.ASCII.GetString(result, 8, 4));
    }

    [Fact]
    public async Task ToOfflinePortraitAsync_PhotoSizedSource_StaysWithinTheSizeBudget()
    {
        using var source = CreateJpeg(1200, 1600);

        var result = await CreateProcessor().ToOfflinePortraitAsync(source, TestContext.Current.CancellationToken);

        Assert.InRange(result.Length, 1, 8 * 1024);
    }

    [Fact]
    public async Task ToOfflinePortraitAsync_SourceWithExifMetadata_StripsIt()
    {
        using var source = CreateJpeg(600, 800, image =>
        {
            image.Metadata.ExifProfile = new ExifProfile();
            image.Metadata.ExifProfile.SetValue(ExifTag.Copyright, "Test Studio");
            image.Metadata.ExifProfile.SetValue(ExifTag.GPSLatitudeRef, "S");
        });

        var result = await CreateProcessor().ToOfflinePortraitAsync(source, TestContext.Current.CancellationToken);

        var info = Image.Identify(result);

        Assert.Null(info.Metadata.ExifProfile);
        Assert.DoesNotContain("Test Studio", Encoding.Latin1.GetString(result), StringComparison.Ordinal);
    }

    [Fact]
    public async Task ToOfflinePortraitAsync_SourceRotatedByExifOrientation_AppliesTheRotation()
    {
        // Orientation 6 means "rotate 90 degrees clockwise to display", so the left half becomes the top half.
        using var source = CreateHalvesJpeg(400, 200, exifOrientation: 6);

        var result = await CreateProcessor().ToOfflinePortraitAsync(source, TestContext.Current.CancellationToken);

        using var portrait = Image.Load<Rgba32>(result);
        var top = portrait[ExpectedSize / 2, 20];
        var bottom = portrait[ExpectedSize / 2, ExpectedSize - 20];

        Assert.True(top.R > 150 && top.B < 100, $"Expected a red top, got {top}.");
        Assert.True(bottom.B > 150 && bottom.R < 100, $"Expected a blue bottom, got {bottom}.");
    }

    [Fact]
    public async Task ToOfflinePortraitAsync_SourceWithoutExifOrientation_KeepsTheOriginalLayout()
    {
        using var source = CreateHalvesJpeg(400, 200, exifOrientation: null);

        var result = await CreateProcessor().ToOfflinePortraitAsync(source, TestContext.Current.CancellationToken);

        using var portrait = Image.Load<Rgba32>(result);
        var left = portrait[20, ExpectedSize / 2];
        var right = portrait[ExpectedSize - 20, ExpectedSize / 2];

        Assert.True(left.R > 150 && left.B < 100, $"Expected a red left, got {left}.");
        Assert.True(right.B > 150 && right.R < 100, $"Expected a blue right, got {right}.");
    }

    [Fact]
    public async Task ToOfflinePortraitAsync_SourceOverTheByteLimit_ThrowsInvalidOperationException()
    {
        using var source = CreateJpeg(600, 800);
        var processor = CreateProcessor(new PortraitProcessingLimits(MaxSourceBytes: 1024));

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => processor.ToOfflinePortraitAsync(source, TestContext.Current.CancellationToken));

        Assert.Contains("1024", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ToOfflinePortraitAsync_SourceOverThePixelLimit_ThrowsInvalidOperationException()
    {
        using var source = CreateJpeg(600, 800);
        var processor = CreateProcessor(new PortraitProcessingLimits(MaxSourcePixels: 1_000));

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => processor.ToOfflinePortraitAsync(source, TestContext.Current.CancellationToken));

        Assert.Contains("600x800", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ToOfflinePortraitAsync_SourceThatIsNotAnImage_ThrowsUnknownImageFormatException()
    {
        using var source = new MemoryStream([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);

        await Assert.ThrowsAsync<UnknownImageFormatException>(
            () => CreateProcessor().ToOfflinePortraitAsync(source, TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task ToOfflinePortraitAsync_NullSource_ThrowsArgumentNullException()
    {
        await Assert.ThrowsAsync<ArgumentNullException>(
            () => CreateProcessor().ToOfflinePortraitAsync(null!, TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task ToOfflinePortraitAsync_CancelledToken_ThrowsOperationCanceledException()
    {
        using var source = CreateJpeg(600, 800);
        using var cancellation = new CancellationTokenSource();
        await cancellation.CancelAsync();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(
            () => CreateProcessor().ToOfflinePortraitAsync(source, cancellation.Token));
    }
}
