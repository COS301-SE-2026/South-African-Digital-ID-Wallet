using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Services;
using Domain.Entities;
using Moq;

namespace tests;

public class DeleteAccountServiceTests
{
    private static DeleteAccountService CreateService(Mock<IDeleteAccountRepository> repositoryMock)
    {
        return new DeleteAccountService(repositoryMock.Object);
    }

    [Fact]
    public async Task DeleteAccountAsync_CitizenExists_DeletesAllCitizenRelatedData()
    {
        var userId = Guid.NewGuid();
        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Names = "Logan",
            Surname = "Dlamini"
        };

        var repositoryMock = new Mock<IDeleteAccountRepository>();
        repositoryMock
            .Setup(r => r.GetCitizenByUserIdAsync(userId))
            .ReturnsAsync(citizen);

        var service = CreateService(repositoryMock);

        await service.DeleteAccountAsync(userId);

        repositoryMock.Verify(r => r.DeleteQrDisclosureTokensAsync(citizen.Id), Times.Once);
        repositoryMock.Verify(r => r.DeleteCredentialsAsync(citizen.Id), Times.Once);
        repositoryMock.Verify(r => r.DeleteTrustedDevicesAsync(citizen.Id), Times.Once);
        repositoryMock.Verify(r => r.DeleteNotificationsAsync(citizen.Id), Times.Once);
        repositoryMock.Verify(r => r.DeleteCitizenAsync(citizen), Times.Once);
    }

    [Fact]
    public async Task DeleteAccountAsync_CitizenExists_AlsoDeletesAuditLogsUserAndSaves()
    {
        var userId = Guid.NewGuid();
        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Names = "Logan",
            Surname = "Dlamini"
        };

        var repositoryMock = new Mock<IDeleteAccountRepository>();
        repositoryMock
            .Setup(r => r.GetCitizenByUserIdAsync(userId))
            .ReturnsAsync(citizen);

        var service = CreateService(repositoryMock);

        await service.DeleteAccountAsync(userId);

        repositoryMock.Verify(r => r.DeleteAuditLogsAsync(userId), Times.Once);
        repositoryMock.Verify(r => r.DeleteUserAsync(userId), Times.Once);
        repositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteAccountAsync_NoCitizen_SkipsCitizenRelatedDeletes()
    {
        var userId = Guid.NewGuid();

        var repositoryMock = new Mock<IDeleteAccountRepository>();
        repositoryMock
            .Setup(r => r.GetCitizenByUserIdAsync(userId))
            .ReturnsAsync((Citizen?)null);

        var service = CreateService(repositoryMock);

        await service.DeleteAccountAsync(userId);

        repositoryMock.Verify(r => r.DeleteQrDisclosureTokensAsync(It.IsAny<Guid>()), Times.Never);
        repositoryMock.Verify(r => r.DeleteCredentialsAsync(It.IsAny<Guid>()), Times.Never);
        repositoryMock.Verify(r => r.DeleteTrustedDevicesAsync(It.IsAny<Guid>()), Times.Never);
        repositoryMock.Verify(r => r.DeleteNotificationsAsync(It.IsAny<Guid>()), Times.Never);
        repositoryMock.Verify(r => r.DeleteCitizenAsync(It.IsAny<Citizen>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAccountAsync_NoCitizen_StillDeletesAuditLogsUserAndSaves()
    {
        var userId = Guid.NewGuid();

        var repositoryMock = new Mock<IDeleteAccountRepository>();
        repositoryMock
            .Setup(r => r.GetCitizenByUserIdAsync(userId))
            .ReturnsAsync((Citizen?)null);

        var service = CreateService(repositoryMock);

        await service.DeleteAccountAsync(userId);

        repositoryMock.Verify(r => r.DeleteAuditLogsAsync(userId), Times.Once);
        repositoryMock.Verify(r => r.DeleteUserAsync(userId), Times.Once);
        repositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteAccountAsync_CallsRepositoryMethodsInExpectedOrder()
    {
        var userId = Guid.NewGuid();
        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Names = "Logan",
            Surname = "Dlamini"
        };

        var callOrder = new List<string>();

        var repositoryMock = new Mock<IDeleteAccountRepository>();
        repositoryMock
            .Setup(r => r.GetCitizenByUserIdAsync(userId))
            .ReturnsAsync(citizen);
        repositoryMock
            .Setup(r => r.DeleteQrDisclosureTokensAsync(citizen.Id))
            .Callback(() => callOrder.Add(nameof(IDeleteAccountRepository.DeleteQrDisclosureTokensAsync)))
            .Returns(Task.CompletedTask);
        repositoryMock
            .Setup(r => r.DeleteCredentialsAsync(citizen.Id))
            .Callback(() => callOrder.Add(nameof(IDeleteAccountRepository.DeleteCredentialsAsync)))
            .Returns(Task.CompletedTask);
        repositoryMock
            .Setup(r => r.DeleteTrustedDevicesAsync(citizen.Id))
            .Callback(() => callOrder.Add(nameof(IDeleteAccountRepository.DeleteTrustedDevicesAsync)))
            .Returns(Task.CompletedTask);
        repositoryMock
            .Setup(r => r.DeleteNotificationsAsync(citizen.Id))
            .Callback(() => callOrder.Add(nameof(IDeleteAccountRepository.DeleteNotificationsAsync)))
            .Returns(Task.CompletedTask);
        repositoryMock
            .Setup(r => r.DeleteCitizenAsync(citizen))
            .Callback(() => callOrder.Add(nameof(IDeleteAccountRepository.DeleteCitizenAsync)))
            .Returns(Task.CompletedTask);
        repositoryMock
            .Setup(r => r.DeleteAuditLogsAsync(userId))
            .Callback(() => callOrder.Add(nameof(IDeleteAccountRepository.DeleteAuditLogsAsync)))
            .Returns(Task.CompletedTask);
        repositoryMock
            .Setup(r => r.DeleteUserAsync(userId))
            .Callback(() => callOrder.Add(nameof(IDeleteAccountRepository.DeleteUserAsync)))
            .Returns(Task.CompletedTask);
        repositoryMock
            .Setup(r => r.SaveChangesAsync())
            .Callback(() => callOrder.Add(nameof(IDeleteAccountRepository.SaveChangesAsync)))
            .Returns(Task.CompletedTask);

        var service = CreateService(repositoryMock);

        await service.DeleteAccountAsync(userId);

        Assert.Equal(
            new[]
            {
                nameof(IDeleteAccountRepository.DeleteQrDisclosureTokensAsync),
                nameof(IDeleteAccountRepository.DeleteCredentialsAsync),
                nameof(IDeleteAccountRepository.DeleteTrustedDevicesAsync),
                nameof(IDeleteAccountRepository.DeleteNotificationsAsync),
                nameof(IDeleteAccountRepository.DeleteCitizenAsync),
                nameof(IDeleteAccountRepository.DeleteAuditLogsAsync),
                nameof(IDeleteAccountRepository.DeleteUserAsync),
                nameof(IDeleteAccountRepository.SaveChangesAsync)
            },
            callOrder);
    }
}