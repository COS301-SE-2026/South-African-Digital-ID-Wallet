using Application.Common.Interfaces.ProviderInterfaces;
using Application.Features.Verification.Dtos;
using Infrastructure.Providers.Decorators;
using Moq;

namespace tests;

public class DemoLivenessBypassProviderDecoratorTests
{
    private readonly Mock<IFaceLivenessServiceProvider> _inner = new();

    [Fact]
    public async Task GetLivenessWithVerifyResultAsync_CompleteResult_PassesLivenessButKeepsFaceMatch()
    {
        _inner.Setup(p => p.GetLivenessWithVerifyResultAsync("session-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new LivenessVerificationResult { IsComplete = true, LivenessPassed = false, FaceMatched = false });
        var decorator = new DemoLivenessBypassProviderDecorator(_inner.Object);

        var result = await decorator.GetLivenessWithVerifyResultAsync("session-1", TestContext.Current.CancellationToken);

        Assert.True(result.LivenessPassed);
        // The face match must never be overridden, even in demo mode
        Assert.False(result.FaceMatched);
    }

    [Fact]
    public async Task GetLivenessWithVerifyResultAsync_IncompleteResult_LeavesLivenessUntouched()
    {
        _inner.Setup(p => p.GetLivenessWithVerifyResultAsync("session-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new LivenessVerificationResult { IsComplete = false, LivenessPassed = null });
        var decorator = new DemoLivenessBypassProviderDecorator(_inner.Object);

        var result = await decorator.GetLivenessWithVerifyResultAsync("session-1", TestContext.Current.CancellationToken);

        Assert.Null(result.LivenessPassed);
    }

    [Fact]
    public async Task CreateLivenessWithVerifySessionAsync_PassesStraightThroughToInnerProvider()
    {
        var expected = new CreateLivenessSessionResult { SessionId = "session-1", AuthToken = "token" };
        using var image = new MemoryStream();
        var correlationId = Guid.NewGuid();
        _inner.Setup(p => p.CreateLivenessWithVerifySessionAsync(image, "image/jpeg", correlationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);
        var decorator = new DemoLivenessBypassProviderDecorator(_inner.Object);

        var result = await decorator.CreateLivenessWithVerifySessionAsync(image, "image/jpeg", correlationId, TestContext.Current.CancellationToken);

        Assert.Same(expected, result);
    }
}
