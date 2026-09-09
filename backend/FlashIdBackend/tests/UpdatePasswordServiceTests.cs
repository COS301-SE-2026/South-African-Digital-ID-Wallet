using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Services;
using Application.Features.UpdatePassword.DTOs;
using Domain.Entities;

namespace tests;

public class UpdatePasswordServiceTests
{

    private const string CurrentPassword = "CurrentPwd123!"; //  NOSONAR - not a real secret
    private const string NewPassword = "BrandNewPwd456!"; //  NOSONAR - not a real secret
    private const string WrongPassword = "InvalidPwd123!"; //  NOSONAR - not a real secret

    private sealed class FakeUpdatePasswordRepository : IUpdatePasswordRepository
    {
        public User? UserToReturn;
        public int Updates;
        public int Saves;

        public Task<User?> GetUserByIdAsync(Guid userId) => Task.FromResult(UserToReturn);
        public Task UpdateUserAsync(User user)
        {
            Updates++;
            return Task.CompletedTask;
        }

        public Task SaveChangesAsync()
        {
            Saves++;
            return Task.CompletedTask;
        }
    }

    private sealed class FakePasswordHashingProvider : IPasswordHashingProvider
    {
        public string HashPassword(string password) => $"hashed-{password}";
        public bool VerifyPassword(string password, string storedHash) => storedHash == $"hashed-{password}";
    }

    private sealed class Ctx
    {
        public FakeUpdatePasswordRepository Repo = null!;
        public UpdatePasswordService Service = null!;
    }

    private static Ctx Setup(User? user = null)
    {
        var repo = new FakeUpdatePasswordRepository { UserToReturn = user };

        return new Ctx
        {
            Repo = repo,
            Service = new UpdatePasswordService(repo, new FakePasswordHashingProvider()),
        };
    }

    private static User CreateUser() => new()
    {
        Id = Guid.NewGuid(),
        Email = "citizen@flashid.test",
        PasswordHash = $"hashed-{CurrentPassword}",
    };

    private static UpdatePasswordDto CreateDto(
        string current = CurrentPassword,
        string next = NewPassword,
        string? confirm = null) => new()
        {
            CurrentPassword = current,
            NewPassword = next,
            ConfirmPassword = confirm ?? next,
        };

    [Fact]
    public async Task UpdatePasswordAsync_UserNotFound_ReturnsFalseAndDoesNotPersist()
    {
        var c = Setup(user: null);

        var result = await c.Service.UpdatePasswordAsync(Guid.NewGuid(), CreateDto());

        Assert.False(result);
        Assert.Equal(0, c.Repo.Updates);
        Assert.Equal(0, c.Repo.Saves);
    }

    [Fact]
    public async Task UpdatePasswordAsync_CurrentPasswordIncorrect_ReturnsFalseAndLeavesHashUnchanged()
    {

        var user = CreateUser();
        var c = Setup(user);

        var result = await c.Service.UpdatePasswordAsync(user.Id, CreateDto(current: WrongPassword));

        Assert.False(result);
        Assert.Equal($"hashed-{CurrentPassword}", user.PasswordHash);
        Assert.Equal(0, c.Repo.Updates);
        Assert.Equal(0, c.Repo.Saves);
    }

    [Fact]
    public async Task UpdatePasswordAsync_ConfirmationDoesNotMatchNewPassword_ReturnsFalseAndLeavesHashUnchanged()
    {
        var user = CreateUser();
        var c = Setup(user);

        var result = await c.Service.UpdatePasswordAsync(user.Id, CreateDto(confirm: "SomethingElse789!"));

        Assert.False(result);
        Assert.Equal($"hashed-{CurrentPassword}", user.PasswordHash);
        Assert.Equal(0, c.Repo.Updates);
        Assert.Equal(0, c.Repo.Saves);
    }

    [Fact]
    public async Task UpdatePasswordAsync_ValidRequest_HashesNewPasswordAndPersistsOnce()
    {

        var user = CreateUser();
        var c = Setup(user);

        var result = await c.Service.UpdatePasswordAsync(user.Id, CreateDto());

        Assert.True(result);
        Assert.Equal($"hashed-{NewPassword}", user.PasswordHash);
        Assert.Equal(1, c.Repo.Updates);
        Assert.Equal(1, c.Repo.Saves);
    }

    [Fact]
    public async Task UpdatePasswordAsync_ValidRequestReusingCurrentPassword_IsAllowed()
    {
        var user = CreateUser();
        var c = Setup(user);

        var result = await c.Service.UpdatePasswordAsync(
            user.Id,
            CreateDto(current: CurrentPassword, next: CurrentPassword));

        Assert.True(result);
        Assert.Equal($"hashed-{CurrentPassword}", user.PasswordHash);
        Assert.Equal(1, c.Repo.Saves);
    }
}
