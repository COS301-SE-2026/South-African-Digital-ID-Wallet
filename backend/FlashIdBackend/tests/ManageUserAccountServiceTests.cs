using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Mapping;
using Application.Common.Services;
using Application.Features.ManageUserAccountCard.Exceptions;
using Domain.Entities;
using Domain.Enums;

namespace tests;

public class ManageUserAccountServiceTests
{
    private const string CurrentEmail = "thandiwe@flashid.test";
    private const string NewEmail = "thandiwe.new@flashid.test";
    private const string CurrentPassword = "CurrentPwd123!"; // NOSONAR - test-only dummy credential, not a real secret
    private const string WrongPassword = "InvalidPwd123!"; // NOSONAR - test-only dummy credential, not a real secret
    private const string KnownOtp = "654321"; // NOSONAR - test-only dummy credential, not a real secret
    private const string TestIpAddress = "192.168.1.10"; // NOSONAR - test-only dummy value, not a real secret

    private sealed class FakeManageUserAccountRepository : IManageUserAccountRepository
    {
        public Citizen? CitizenToReturn;
        public User? UserToReturn;
        public bool EmailTaken;
        public bool ConfirmSucceeds = true;

        public int CitizenUpdates;
        public int UserUpdates;
        public int Saves;
        public int ConfirmCalls;
        public List<AuditLog> AuditLogs = new();
        public List<(string Email, Guid ExcludeUserId)> EmailTakenChecks = new();
        public AuditLog? ConfirmedAuditLog;

        public Task<Citizen?> GetByUserIdAsync(Guid userId) => Task.FromResult(CitizenToReturn);

        public Task UpdateAsync(Citizen citizen)
        {
            CitizenUpdates++;
            return Task.CompletedTask;
        }

        public Task<User?> GetUserByIdAsync(Guid userId) => Task.FromResult(UserToReturn);

        public Task UpdateUserAsync(User user)
        {
            UserUpdates++;
            return Task.CompletedTask;
        }

        public Task<bool> IsEmailTakenAsync(string email, Guid excludeUserId)
        {
            EmailTakenChecks.Add((email, excludeUserId));
            return Task.FromResult(EmailTaken);
        }

        public Task AddAuditLogAsync(AuditLog auditLog)
        {
            AuditLogs.Add(auditLog);
            return Task.CompletedTask;
        }

        public Task SaveChangesAsync()
        {
            Saves++;
            return Task.CompletedTask;
        }

        public Task<bool> TryConfirmEmailChangeAsync(User user, AuditLog auditLog)
        {
            ConfirmCalls++;
            ConfirmedAuditLog = auditLog;
            return Task.FromResult(ConfirmSucceeds);
        }
    }

    private sealed class FakePasswordHashingProvider : IPasswordHashingProvider
    {
        public List<string> Hashed = new();

        public string HashPassword(string password)
        {
            Hashed.Add(password);
            return $"hashed-{password}";
        }

        public bool VerifyPassword(string password, string storedHash) => storedHash == $"hashed-{password}";
    }

    private sealed class FakeEmailSenderProvider : IEmailSenderProvider
    {
        public List<(string To, string Subject, string Message)> Sent = new();

        public Task SendEmailAsync(string toEmail, string subject, string message, CancellationToken ct = default)
        {
            Sent.Add((toEmail, subject, message));
            return Task.CompletedTask;
        }
    }

    private sealed class Ctx
    {
        public FakeManageUserAccountRepository Repo = null!;
        public FakePasswordHashingProvider Hasher = null!;
        public FakeEmailSenderProvider Email = null!;
        public ManageUserAccountService Service = null!;
    }

    private static Ctx Setup(
        User? user = null,
        Citizen? citizen = null,
        bool emailTaken = false,
        bool confirmSucceeds = true)
    {
        var repo = new FakeManageUserAccountRepository
        {
            UserToReturn = user,
            CitizenToReturn = citizen,
            EmailTaken = emailTaken,
            ConfirmSucceeds = confirmSucceeds,
        };

        var hasher = new FakePasswordHashingProvider();
        var email = new FakeEmailSenderProvider();

        return new Ctx
        {
            Repo = repo,
            Hasher = hasher,
            Email = email,
            Service = new ManageUserAccountService(repo, new ManageUserAccountMapper(), hasher, email),
        };
    }

    private static User CreateUser() => new()
    {
        Id = Guid.NewGuid(),
        Email = CurrentEmail,
        PhoneNumber = "+27821234567",
        PasswordHash = $"hashed-{CurrentPassword}",
        LastLoginAt = new DateTime(2026, 9, 1, 8, 0, 0, DateTimeKind.Utc),
    };

    private static User CreateReverifiedUser()
    {
        var user = CreateUser();
        user.MarkPasswordReverified();
        return user;
    }

    private static User CreateUserWithPendingChange(int expiryMinutes = 10)
    {
        var user = CreateUser();
        user.SetPendingEmailChange(NewEmail, $"hashed-{KnownOtp}", expiryMinutes);
        return user;
    }

    private static Citizen CreateCitizen(User? user = null) => new()
    {
        Id = Guid.NewGuid(),
        SaId = "9001015800085",
        Names = "Thandiwe",
        Surname = "Dlamini",
        DateOfBirth = new DateTime(1990, 1, 1),
        Status = CitizenStatus.Verified,
        CreatedAt = new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc),
        UserId = user?.Id,
        User = user,
    };

    [Fact]
    public async Task GetAccountAsync_WhenCitizenNotFound_ReturnsNull()
    {
        var c = Setup(citizen: null);

        var result = await c.Service.GetAccountAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact]
    public async Task GetAccountAsync_WithLinkedUser_ProjectsCitizenAndUserOntoTheDto()
    {
        var user = CreateUser();
        var c = Setup(citizen: CreateCitizen(user));

        var result = await c.Service.GetAccountAsync(user.Id);

        Assert.NotNull(result);
        Assert.Equal("Thandiwe Dlamini", result!.FullName);
        Assert.Equal("085", result.IdEnding);
        Assert.Equal(CurrentEmail, result.EmailAddress);
        Assert.Equal("+27821234567", result.PhoneNumber);
        Assert.Equal(user.LastLoginAt, result.LastLogin);
        Assert.Equal(new DateOnly(1990, 1, 1), result.DateOfBirth);
        Assert.Equal(new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc), result.MemberSince);
        Assert.Equal(CitizenStatus.Verified, result.AccountStatus);
    }

    [Fact]
    public async Task GetAccountAsync_WithNoLinkedUser_LeavesContactFieldsEmpty()
    {
        var c = Setup(citizen: CreateCitizen(user: null));

        var result = await c.Service.GetAccountAsync(Guid.NewGuid());

        Assert.NotNull(result);
        Assert.Equal(string.Empty, result!.EmailAddress);
        Assert.Equal(string.Empty, result.PhoneNumber);
        Assert.Null(result.LastLogin);
    }

    [Fact]
    public async Task VerifyPasswordAsync_WhenUserNotFound_ThrowsIncorrectPassword()
    {
        var c = Setup(user: null);

        await Assert.ThrowsAsync<IncorrectPasswordException>(
            () => c.Service.VerifyPasswordAsync(Guid.NewGuid(), CurrentPassword, TestIpAddress));
    }

    [Fact]
    public async Task VerifyPasswordAsync_WhenAccountIsLockedOut_ThrowsAccountLockedAndDoesNotCountAnAttempt()
    {
        var user = CreateUser();
        user.LockoutUntil = DateTime.UtcNow.AddMinutes(15);
        var c = Setup(user);

        await Assert.ThrowsAsync<AccountLockedException>(
            () => c.Service.VerifyPasswordAsync(user.Id, CurrentPassword, TestIpAddress));

        Assert.Equal(0, user.FailedLoginAttempts);
        Assert.Equal(0, c.Repo.Saves);
    }

    [Fact]
    public async Task VerifyPasswordAsync_WhenLockoutHasExpired_AllowsTheAttempt()
    {
        var user = CreateUser();
        user.LockoutUntil = DateTime.UtcNow.AddMinutes(-1);
        var c = Setup(user);

        await c.Service.VerifyPasswordAsync(user.Id, CurrentPassword, TestIpAddress);

        Assert.Null(user.LockoutUntil);
        Assert.NotNull(user.PasswordReverifiedAt);
    }

    [Fact]
    public async Task VerifyPasswordAsync_WithWrongPassword_CountsTheAttemptAndWritesAnAuditLog()
    {
        var user = CreateUser();
        var c = Setup(user);

        await Assert.ThrowsAsync<IncorrectPasswordException>(
            () => c.Service.VerifyPasswordAsync(user.Id, WrongPassword, TestIpAddress));

        Assert.Equal(1, user.FailedLoginAttempts);
        Assert.Null(user.LockoutUntil);
        Assert.Null(user.PasswordReverifiedAt);

        var log = Assert.Single(c.Repo.AuditLogs);
        Assert.Equal(AuditEventType.FailedLoginAttempt, log.EventType);
        Assert.Equal(user.Id, log.ActorId);
        Assert.Equal(TestIpAddress, log.IpAddress);
        Assert.Contains(CurrentEmail, log.Details);
        Assert.Equal(1, c.Repo.Saves);
    }

    [Fact]
    public async Task VerifyPasswordAsync_OnFourthConsecutiveFailure_DoesNotLockTheAccount()
    {
        var user = CreateUser();
        user.FailedLoginAttempts = 3;
        var c = Setup(user);

        await Assert.ThrowsAsync<IncorrectPasswordException>(
            () => c.Service.VerifyPasswordAsync(user.Id, WrongPassword, TestIpAddress));

        Assert.Equal(4, user.FailedLoginAttempts);
        Assert.Null(user.LockoutUntil);
    }

    [Fact]
    public async Task VerifyPasswordAsync_OnFifthConsecutiveFailure_LocksTheAccountForThirtyMinutes()
    {
        var user = CreateUser();
        user.FailedLoginAttempts = 4;
        var c = Setup(user);
        var before = DateTime.UtcNow;

        await Assert.ThrowsAsync<IncorrectPasswordException>(
            () => c.Service.VerifyPasswordAsync(user.Id, WrongPassword, TestIpAddress));

        Assert.Equal(5, user.FailedLoginAttempts);
        Assert.NotNull(user.LockoutUntil);
        Assert.InRange(user.LockoutUntil!.Value, before.AddMinutes(30), DateTime.UtcNow.AddMinutes(30));
    }

    [Fact]
    public async Task VerifyPasswordAsync_WithCorrectPassword_ResetsFailuresAndMarksReverified()
    {
        var user = CreateUser();
        user.FailedLoginAttempts = 3;
        var c = Setup(user);
        var before = DateTime.UtcNow;

        await c.Service.VerifyPasswordAsync(user.Id, CurrentPassword, TestIpAddress);

        Assert.Equal(0, user.FailedLoginAttempts);
        Assert.Null(user.LockoutUntil);
        Assert.NotNull(user.PasswordReverifiedAt);
        Assert.InRange(user.PasswordReverifiedAt!.Value, before, DateTime.UtcNow);
        Assert.Empty(c.Repo.AuditLogs);
        Assert.Equal(1, c.Repo.Saves);
    }

    [Fact]
    public async Task RequestEmailChangesAsync_WhenUserNotFound_ThrowsReauthRequired()
    {
        var c = Setup(user: null);

        await Assert.ThrowsAsync<ReauthRequiredException>(
            () => c.Service.RequestEmailChangesAsync(Guid.NewGuid(), NewEmail));
    }

    [Fact]
    public async Task RequestEmailChangesAsync_WhenPasswordWasNeverReverified_ThrowsReauthRequired()
    {
        var user = CreateUser();
        var c = Setup(user);

        await Assert.ThrowsAsync<ReauthRequiredException>(
            () => c.Service.RequestEmailChangesAsync(user.Id, NewEmail));

        Assert.Empty(c.Email.Sent);
    }

    [Fact]
    public async Task RequestEmailChangesAsync_WhenReverificationHasExpired_ThrowsReauthRequired()
    {
        var user = CreateUser();
        user.PasswordReverifiedAt = DateTime.UtcNow.AddMinutes(-11);
        var c = Setup(user);

        await Assert.ThrowsAsync<ReauthRequiredException>(
            () => c.Service.RequestEmailChangesAsync(user.Id, NewEmail));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("not-an-email")]
    [InlineData("missing@")]
    [InlineData("@nodomain.test")]
    [InlineData(" padded@flashid.test ")]
    public async Task RequestEmailChangesAsync_WithUnusableEmail_ThrowsInvalidEmail(string candidate)
    {
        var user = CreateReverifiedUser();
        var c = Setup(user);

        await Assert.ThrowsAsync<InvalidEmailException>(
            () => c.Service.RequestEmailChangesAsync(user.Id, candidate));

        Assert.Null(user.PendingEmail);
        Assert.Empty(c.Email.Sent);
    }

    [Theory]
    [InlineData(CurrentEmail)]
    [InlineData("THANDIWE@FLASHID.TEST")]
    public async Task RequestEmailChangesAsync_WithTheAddressAlreadyOnTheAccount_ThrowsInvalidEmail(string candidate)
    {
        var user = CreateReverifiedUser();
        var c = Setup(user);

        await Assert.ThrowsAsync<InvalidEmailException>(
            () => c.Service.RequestEmailChangesAsync(user.Id, candidate));
    }

    [Fact]
    public async Task RequestEmailChangesAsync_WhenAddressBelongsToAnotherAccount_ThrowsNewEmailTaken()
    {
        var user = CreateReverifiedUser();
        var c = Setup(user, emailTaken: true);

        var ex = await Assert.ThrowsAsync<NewEmailTakenException>(
            () => c.Service.RequestEmailChangesAsync(user.Id, NewEmail));

        Assert.Contains(NewEmail, ex.Message);
        Assert.Null(user.PendingEmail);
        Assert.Empty(c.Email.Sent);
    }

    [Fact]
    public async Task RequestEmailChangesAsync_WithValidAddress_StoresPendingChangeAndEmailsTheOtp()
    {
        var user = CreateReverifiedUser();
        var c = Setup(user);

        await c.Service.RequestEmailChangesAsync(user.Id, NewEmail);

        var otp = Assert.Single(c.Hasher.Hashed);
        Assert.Matches("^[0-9]{6}$", otp);

        Assert.Equal(NewEmail, user.PendingEmail);
        Assert.Equal($"hashed-{otp}", user.EmailOTPHash);
        Assert.Equal(CurrentEmail, user.Email);
        Assert.False(user.IsOtpExpired());

        var sent = Assert.Single(c.Email.Sent);
        Assert.Equal(NewEmail, sent.To);
        Assert.Contains(otp, sent.Message);
        Assert.Equal(1, c.Repo.Saves);
    }

    [Fact]
    public async Task RequestEmailChangesAsync_WithValidAddress_ConsumesThePasswordReverification()
    {
        var user = CreateReverifiedUser();
        var c = Setup(user);

        await c.Service.RequestEmailChangesAsync(user.Id, NewEmail);

        Assert.Null(user.PasswordReverifiedAt);
    }

    [Fact]
    public async Task RequestEmailChangesAsync_ChecksAvailabilityExcludingTheRequestingUser()
    {
        var user = CreateReverifiedUser();
        var c = Setup(user);

        await c.Service.RequestEmailChangesAsync(user.Id, NewEmail);

        var check = Assert.Single(c.Repo.EmailTakenChecks);
        Assert.Equal(NewEmail, check.Email);
        Assert.Equal(user.Id, check.ExcludeUserId);
    }

    [Fact]
    public async Task ResendEmailChangeOtpAsync_WhenUserNotFound_ThrowsNoPendingEmailChange()
    {
        var c = Setup(user: null);

        await Assert.ThrowsAsync<NoPendingEmailChangeException>(
            () => c.Service.ResendEmailChangeOtpAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task ResendEmailChangeOtpAsync_WithNoPendingChange_ThrowsNoPendingEmailChange()
    {
        var user = CreateUser();
        var c = Setup(user);

        await Assert.ThrowsAsync<NoPendingEmailChangeException>(
            () => c.Service.ResendEmailChangeOtpAsync(user.Id));
    }

    [Fact]
    public async Task ResendEmailChangeOtpAsync_RotatesTheOtpAndResendsToThePendingAddress()
    {
        var user = CreateUserWithPendingChange();
        var c = Setup(user);

        await c.Service.ResendEmailChangeOtpAsync(user.Id);

        var otp = Assert.Single(c.Hasher.Hashed);
        Assert.NotEqual(KnownOtp, otp);
        Assert.Equal($"hashed-{otp}", user.EmailOTPHash);

        var sent = Assert.Single(c.Email.Sent);
        Assert.Equal(NewEmail, sent.To);
        Assert.Contains(otp, sent.Message);
    }

    [Fact]
    public async Task ResendEmailChangeOtpAsync_BeyondThreeResends_ThrowsAndSendsNothing()
    {
        var user = CreateUserWithPendingChange();
        var c = Setup(user);

        await c.Service.ResendEmailChangeOtpAsync(user.Id);
        await c.Service.ResendEmailChangeOtpAsync(user.Id);
        await c.Service.ResendEmailChangeOtpAsync(user.Id);

        await Assert.ThrowsAsync<TooManyEmailChangeOtpAttemptsException>(
            () => c.Service.ResendEmailChangeOtpAsync(user.Id));

        Assert.Equal(3, c.Email.Sent.Count);
        Assert.Equal(3, c.Repo.Saves);
    }

    [Fact]
    public async Task ConfirmEmailChangeAsync_WhenUserNotFound_ThrowsNoPendingEmailChange()
    {
        var c = Setup(user: null);

        await Assert.ThrowsAsync<NoPendingEmailChangeException>(
            () => c.Service.ConfirmEmailChangeAsync(Guid.NewGuid(), KnownOtp, TestIpAddress));
    }

    [Fact]
    public async Task ConfirmEmailChangeAsync_WithNoPendingChange_ThrowsNoPendingEmailChange()
    {
        var user = CreateUser();
        var c = Setup(user);

        await Assert.ThrowsAsync<NoPendingEmailChangeException>(
            () => c.Service.ConfirmEmailChangeAsync(user.Id, KnownOtp, TestIpAddress));
    }

    [Fact]
    public async Task ConfirmEmailChangeAsync_WithExpiredOtp_ThrowsEmailChangeOtpExpired()
    {
        var user = CreateUserWithPendingChange(expiryMinutes: -1);
        var c = Setup(user);

        await Assert.ThrowsAsync<EmailChangeOtpExpiredException>(
            () => c.Service.ConfirmEmailChangeAsync(user.Id, KnownOtp, TestIpAddress));

        Assert.Equal(CurrentEmail, user.Email);
    }

    [Fact]
    public async Task ConfirmEmailChangeAsync_WhenOtpWasCleared_ThrowsEmailChangeOtpExpired()
    {
        var user = CreateUserWithPendingChange();
        user.ClearOtp();
        var c = Setup(user);

        await Assert.ThrowsAsync<EmailChangeOtpExpiredException>(
            () => c.Service.ConfirmEmailChangeAsync(user.Id, KnownOtp, TestIpAddress));
    }

    [Fact]
    public async Task ConfirmEmailChangeAsync_AfterFiveFailedAttempts_ThrowsTooManyAttempts()
    {
        var user = CreateUserWithPendingChange();
        for (var i = 0; i < 5; i++) user.IncrementOtpAttempt();
        var c = Setup(user);

        await Assert.ThrowsAsync<TooManyEmailChangeOtpAttemptsException>(
            () => c.Service.ConfirmEmailChangeAsync(user.Id, KnownOtp, TestIpAddress));

        Assert.Equal(CurrentEmail, user.Email);
    }

    [Fact]
    public async Task ConfirmEmailChangeAsync_WithWrongOtp_CountsTheAttemptAndLeavesEmailUnchanged()
    {
        var user = CreateUserWithPendingChange();
        var c = Setup(user);

        await Assert.ThrowsAsync<InvalidEmailChangeOtpException>(
            () => c.Service.ConfirmEmailChangeAsync(user.Id, "000000", TestIpAddress));

        Assert.Equal(1, user.OTPAttemptCount);
        Assert.Equal(CurrentEmail, user.Email);
        Assert.Equal(NewEmail, user.PendingEmail);
        Assert.Equal(1, c.Repo.Saves);
        Assert.Equal(0, c.Repo.ConfirmCalls);
    }

    [Fact]
    public async Task ConfirmEmailChangeAsync_WhenAddressWasClaimedSinceTheRequest_ClearsThePendingChange()
    {
        var user = CreateUserWithPendingChange();
        var c = Setup(user, emailTaken: true);

        var ex = await Assert.ThrowsAsync<NewEmailTakenException>(
            () => c.Service.ConfirmEmailChangeAsync(user.Id, KnownOtp, TestIpAddress));

        Assert.Contains(NewEmail, ex.Message);
        Assert.Null(user.PendingEmail);
        Assert.Equal(CurrentEmail, user.Email);
        Assert.Equal(0, c.Repo.ConfirmCalls);
    }

    [Fact]
    public async Task ConfirmEmailChangeAsync_WhenThePersistedUpdateIsRejected_ThrowsNewEmailTaken()
    {
        var user = CreateUserWithPendingChange();
        var c = Setup(user, confirmSucceeds: false);

        await Assert.ThrowsAsync<NewEmailTakenException>(
            () => c.Service.ConfirmEmailChangeAsync(user.Id, KnownOtp, TestIpAddress));

        Assert.Equal(1, c.Repo.ConfirmCalls);
    }

    [Fact]
    public async Task ConfirmEmailChangeAsync_WithCorrectOtp_PromotesTheEmailAndAuditsTheChange()
    {
        var user = CreateUserWithPendingChange();
        var c = Setup(user, citizen: CreateCitizen(user));
        var before = DateTime.UtcNow;

        var result = await c.Service.ConfirmEmailChangeAsync(user.Id, KnownOtp, TestIpAddress);

        Assert.Equal(NewEmail, user.Email);
        Assert.Null(user.PendingEmail);
        Assert.Equal(1, c.Repo.ConfirmCalls);

        var log = c.Repo.ConfirmedAuditLog;
        Assert.NotNull(log);
        Assert.Equal(AuditEventType.EmailAddressChanged, log!.EventType);
        Assert.Equal(user.Id, log.ActorId);
        Assert.Equal(TestIpAddress, log.IpAddress);
        Assert.Contains(CurrentEmail, log.Details);
        Assert.Contains(NewEmail, log.Details);
        Assert.InRange(log.CreatedAt, before, DateTime.UtcNow);

        Assert.NotNull(result);
        Assert.Equal(NewEmail, result!.EmailAddress);
    }

    [Fact]
    public async Task ConfirmEmailChangeAsync_WhenNoCitizenRecordExists_ReturnsNullAfterCommitting()
    {
        var user = CreateUserWithPendingChange();
        var c = Setup(user, citizen: null);

        var result = await c.Service.ConfirmEmailChangeAsync(user.Id, KnownOtp, TestIpAddress);

        Assert.Null(result);
        Assert.Equal(NewEmail, user.Email);
        Assert.Equal(1, c.Repo.ConfirmCalls);
    }
}
