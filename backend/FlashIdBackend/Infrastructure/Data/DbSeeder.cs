using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace Infrastructure.Data;

// DbSeeder runs at startup to ensure the database has:
//   1. Migrations applied
//   2. Seeded Domain Users (200 total: 140 Citizens, 40 Officials, 20 GovernmentAdministrators)
//   3. Seeded Citizen records (140)
//   4. Seeded Official records (40) assigned to 5 Institutions
//   5. Seeded GovernmentAdministrator records (20) with 5 registered Institutions
//   6. Seeded Credentials + IdentityDocuments for all 140 Citizens
//   7. Seeded DriversLicenses for Citizens aged 18+ (approximately 132)
//   8. Seeded UserPreferences for all 200 Users
//   9. Seeded AuditLogs for all 200 Users (2-5 entries each, approximately 703 total)
//   10. Seeded TrustedDevices for all Citizens
//   11. Seeded Notifications for all Citizens
//
// NOTE: Biometrics seeding is intentionally skipped.
// Biometrics stores cryptographic hashes (FaceHash, FingerprintHash) of real
// biometric data. Seeding fake hashes would be misleading and could cause
// issues when the actual biometric hashing feature is implemented.
// Biometrics will be seeded once the facial recognition and fingerprint
// scanning features are built out.
public static class DbSeeder
{
    private sealed record DeviceTemplate(string DeviceType, string OperatingSystem, string Browser);
    private sealed record LocationTemplate(string City, string Country);
    private sealed record NotificationTemplate(string Title, string Description, string Tone);

    private static readonly string[] FirstNames = new[]
    {
        "Liam","Noah","Ethan","Mason","Logan","James","Oliver","Benjamin","Elijah","Lucas",
        "Mia","Emma","Olivia","Ava","Isabella","Sophia","Charlotte","Amelia","Harper","Evelyn",
        "Thabo","Sipho","Nkosi","Sizwe","Lungelo","Bongani","Kgosi","Kayla","Zanele","Nomsa",
        "Amogelang","Tshepo","Kagiso","Lesedi","Palesa","Neo","Mpho","Tendai","Kabelo","Sibusiso",
        "Zinhle","Mandla","Andile","Zuko","Nosipho","Lerato","Mbali","Nokuthula","Xolani","Sizweleo",
        "Daniel","Samuel","Jacob","Michael","William","Alexander","Henry","Sebastian","Levi","Mateo",
        "Anele","Fikile","Yandiswa","Nokwanda","Sanele","Khanya","Thandolwethu","Busi","Karabo","Pule"
    };

    private static readonly string[] LastNames = new[]
    {
        "Ngata","Chisadza","Mokoena","Dlamini","Naidoo","Sithole","Botha","VanDerMerwe","Nkosi","Khumalo",
        "Mafolo","Mabena","Mkhize","Maseko","Mabuza","Matsheka","Morrell","Meyer","VanWyk","Kruger",
        "Smith","Johnson","Brown","Williams","Jones","Miller","Wilson","Anderson","Thomas","Taylor",
        "Patel","Khan","Singh","Naidoo","Pillay","Govender","Perumal","Singh","Mahlangu","Radebe",
        "Swanepoel","Botha","VanHeerden","Gumede","Mthembu","Mabuyi","Magubane","Mabutho","Mntambo","Mdluli"
    };

    private static readonly string[] SampleIpAddresses = new[]
    {
        "102.130.10.1", "196.11.240.5", "41.21.100.3", // NOSONAR
        "154.0.5.22", "196.25.200.8", "41.113.10.14", // NOSONAR
        "102.65.30.9", "196.15.45.7", "41.205.20.11" // NOSONAR
    };

    private static readonly string[] MockPhotoBlobNames = new[]
    {
        "mock-photos-robin.png",
        "mock-photos-raven.png",
        "mock-photos-beast-boy.png",
        "mock-photos-cyborg.png",
        "mock-photos-starfire.png",
    };

    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();
        // shared uniqueness trackers so users across roles don't collide
        var usedEmails = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var usedPhones = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        await SeedCitizenUsersAsync(context, usedEmails, usedPhones);
        await SeedPendingCitizenActivationAsync(context);
        // Government administrators must exist before creating institutions or officials
        await SeedGovernmentAdministratorUsersAsync(context, usedEmails, usedPhones);
        await SeedOfficialUsersAsync(context, usedEmails, usedPhones);
        await SeedE2ETestUsersAsync(context);
        await SeedNfrTestUsersAsync(context);
        await RepairInvalidPasswordHashesAsync(context);
        await SeedCredentialsAsync(context);
        await SeedUserPreferencesAsync(context);
        await SeedAuditLogsAsync(context);
        await SeedTrustedDevicesAsync(context);
        await SeedNotificationsAsync(context);
        await SeedExpiryE2ECitizenAsync(context);
    }

    internal static async Task SeedNfrTestUsersAsync(AppDbContext context)
    {
        var now = DateTime.UtcNow;

        async Task<User> EnsureUserAsync(string email, string phone, UserRole role)
        {
            var existing = await context.DomainUsers.FirstOrDefaultAsync(u => u.Email == email);
            if (existing != null) return existing;

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = email,
                PhoneNumber = phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                IsDeleted = false,
                IsEmailVerified = true,
                Role = role,
                CreatedAt = now,
                UpdatedAt = now
            };
            await context.DomainUsers.AddAsync(user);
            await context.SaveChangesAsync();
            return user;
        }

        async Task EnsureTrustedDeviceAsync(Guid userId, string rawDeviceToken)
        {
            var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawDeviceToken)));
            if (await context.TrustedDevices.AnyAsync(d => d.UserId == userId && d.DeviceTokenHash == hash)) return;

            await context.TrustedDevices.AddAsync(new TrustedDevice
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                DeviceTokenHash = hash,
                DeviceType = DeviceType.Desktop,
                OperatingSystem = "k6",
                Browser = "k6",
                LastKnownCity = "Pretoria",
                LastKnownCountry = "South Africa",
                LastActive = now,
                IsTrusted = true,
                CreatedAt = now,
                UpdatedAt = now,
            });
            await context.SaveChangesAsync();
        }

        // Fixed pool of 10 NFR-only citizens: nfr-citizen-00@flashid.local .. nfr-citizen-09@flashid.local
        for (int i = 0; i < 10; i++)
        {
            var email = $"nfr-citizen-{i:00}@flashid.local";
            var user = await EnsureUserAsync(email, $"+2782000{i:0000}", UserRole.Citizen);
            await EnsureTrustedDeviceAsync(user.Id, $"nfr-k6-device-{i:00}");

            if (!await context.Citizens.AnyAsync(c => c.UserId == user.Id))
            {
                await context.Citizens.AddAsync(new Citizen
                {
                    Id = Guid.NewGuid(),
                    SaId = $"800000000{i:0000}", // reserved NFR SA ID block, distinct from real seed ranges
                    Names = "NFR",
                    Surname = $"Citizen{i:00}",
                    DateOfBirth = now.AddYears(-30),
                    Gender = Gender.Other,
                    Status = CitizenStatus.Activated,
                    UserId = user.Id,
                    CreatedAt = now,
                    UpdatedAt = now
                });
                await context.SaveChangesAsync();
            }
        }

        // One dedicated GovernmentAdministrator for expiry-check load testing
        var govAdminUser = await EnsureUserAsync("nfr-govadmin@flashid.local", "+27820009999", UserRole.GovernmentAdministrator);
        await EnsureTrustedDeviceAsync(govAdminUser.Id, "nfr-k6-device-govadmin");
    }

    internal static async Task SeedE2ETestUsersAsync(AppDbContext context)
    {
        var now = DateTime.UtcNow;

        async Task<User> EnsureUserAsync(string email, string phone, UserRole role)
        {
            var existing = await context.DomainUsers.FirstOrDefaultAsync(u => u.Email == email);
            if (existing != null)
            {
                return existing;
            }
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = email,
                PhoneNumber = phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                FailedLoginAttempts = 0,
                IsDeleted = false,
                IsEmailVerified = true,
                Role = role,
                CreatedAt = now,
                UpdatedAt = now
            };

            await context.DomainUsers.AddAsync(user);
            await context.SaveChangesAsync();
            return user;
        }

        var citizenUser = await EnsureUserAsync("citizen.e2e@flashid.local", "+27810000001", UserRole.Citizen);
        if (!await context.Citizens.AnyAsync(c => c.UserId == citizenUser.Id))
        {
            await context.Citizens.AddAsync(new Citizen
            {
                Id = Guid.NewGuid(),
                SaId = "0000000000001",
                Names = "E2E",
                Surname = "Citizen",
                DateOfBirth = now.AddYears(-30),
                Gender = Gender.Other,
                Status = CitizenStatus.Activated,
                UserId = citizenUser.Id,
                CreatedAt = now,
                UpdatedAt = now
            });
            await context.SaveChangesAsync();
        }

        var citizen = await context.Citizens.SingleAsync(c => c.UserId == citizenUser.Id);
        var citizenLicense = await context.DriversLicenses
            .Include(dl => dl.Credential)
            .FirstOrDefaultAsync(dl => dl.Credential.CitizenId == citizen.Id);

        if (citizenLicense == null)
        {
            var licenseCred = new Credential
            {
                Id = Guid.NewGuid(),
                Status = CredentialStatus.Active,
                Signature = "e2e-seed-sig",
                IssuedBy = "Licensing Dept Cape Town",
                IssueDate = now.AddYears(-2),
                CitizenId = citizen.Id,
                CreatedAt = now,
                UpdatedAt = now,
            };

            await context.Credentials.AddAsync(licenseCred);
            await context.SaveChangesAsync();

            citizenLicense = new DriversLicense
            {
                Id = Guid.NewGuid(),
                LicenseNumber = "E2EACTIVE001",
                LicenseCode = LicenseCode.EB,
                Restrictions = "00",
                PhotoPath = "mock-photos-raven.png",
                CredentialId = licenseCred.Id,
                CreatedAt = now,
                UpdatedAt = now,
            };

            await context.DriversLicenses.AddAsync(citizenLicense);
        }

        citizenLicense.ExpiryDate = now.AddYears(5);
        citizenLicense.Credential.Status = CredentialStatus.Active;

        await context.SaveChangesAsync();

        var govUser = await EnsureUserAsync("govadmin.e2e@flashid.local", "+27810000002", UserRole.GovernmentAdministrator);
        if (!await context.GovernmentAdministrators.AnyAsync(g => g.UserId == govUser.Id))
        {
            await context.GovernmentAdministrators.AddAsync(new GovernmentAdministrator
            {
                Id = Guid.NewGuid(),
                GovernmentId = "GOVE2E01",
                Names = "E2E",
                Surname = "GovAdmin",
                UserId = govUser.Id,
                CreatedAt = now,
                UpdatedAt = now
            });
            await context.SaveChangesAsync();
        }

        var officialUser = await EnsureUserAsync("official.e2e@flashid.local", "+27810000003", UserRole.Official);
        if (!await context.Officials.AnyAsync(o => o.UserId == officialUser.Id))
        {
            var institution = await context.Institutions.FirstOrDefaultAsync();
            if (institution != null)
            {
                await context.Officials.AddAsync(new Official
                {
                    Id = Guid.NewGuid(),
                    OfficialId = "OFFE2E01",
                    Names = "E2E",
                    Surname = "Official",
                    UserId = officialUser.Id,
                    InstitutionId = institution.Id,
                    CreatedAt = now,
                    UpdatedAt = now
                });
                await context.SaveChangesAsync();
            }
        }
    }

    private static async Task SeedExpiryE2ECitizenAsync(AppDbContext context)
    {
        var now = DateTime.UtcNow;
        var user = await context.DomainUsers.FirstOrDefaultAsync(u => u.Email == "citizen.expiry.e2e@flashid.local");

        if (user == null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                Email = "citizen.expiry.e2e@flashid.local",
                PhoneNumber = "+27810000004",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                FailedLoginAttempts = 0,
                IsDeleted = false,
                IsEmailVerified = true,
                Role = UserRole.Citizen,
                CreatedAt = now,
                UpdatedAt = now,
            };

            await context.DomainUsers.AddAsync(user);
            await context.SaveChangesAsync();
        }

        var citizen = await context.Citizens.FirstOrDefaultAsync(c => c.UserId == user.Id);

        if (citizen == null)
        {
            citizen = new Citizen
            {
                Id = Guid.NewGuid(),
                SaId = "0000000000099",
                Names = "Expiry",
                Surname = "Citizen",
                DateOfBirth = now.AddYears(-30),
                Gender = Gender.Other,
                Status = CitizenStatus.Activated,
                UserId = user.Id,
                CreatedAt = now,
                UpdatedAt = now,
            };

            await context.Citizens.AddAsync(citizen);
            await context.SaveChangesAsync();
        }

        var license = await context.DriversLicenses
            .Include(dl => dl.Credential)
            .FirstOrDefaultAsync(dl => dl.Credential.CitizenId == citizen.Id);

        if (license == null)
        {
            var licenseCred = new Credential
            {
                Id = Guid.NewGuid(),
                Status = CredentialStatus.Active,
                Signature = "e2e-sig",
                IssuedBy = "Licensing Dept Durban",
                IssueDate = now.AddYears(-5),
                CitizenId = citizen.Id,
                CreatedAt = now,
                UpdatedAt = now,
            };

            await context.Credentials.AddAsync(licenseCred);
            await context.SaveChangesAsync();

            license = new DriversLicense
            {
                Id = Guid.NewGuid(),
                LicenseNumber = "E2EEXPIRED001",
                LicenseCode = LicenseCode.EB,
                Restrictions = "00",
                PhotoPath = "mock-photos-robin.png",
                CredentialId = licenseCred.Id,
                CreatedAt = now,
                UpdatedAt = now,
            };

            await context.DriversLicenses.AddAsync(license);
        }

        license.ExpiryDate = now.AddDays(-30);
        license.Credential.Status = CredentialStatus.Active;

        await context.SaveChangesAsync();
    }

    private static async Task RepairInvalidPasswordHashesAsync(AppDbContext context)
    {
        var allUsers = await context.DomainUsers.ToListAsync();
        var usersWithInvalidHashes = allUsers
            .Where(u =>
                string.IsNullOrWhiteSpace(u.PasswordHash)
                || !u.PasswordHash.StartsWith("$2", StringComparison.Ordinal)
                || u.PasswordHash.Length < 40
            )
            .ToList();

        if (usersWithInvalidHashes.Count == 0)
            return;

        var now = DateTime.UtcNow;

        foreach (var user in usersWithInvalidHashes)
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123");
            user.UpdatedAt = now;
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedCitizenUsersAsync(AppDbContext context, HashSet<string> usedEmails, HashSet<string> usedPhones)
    {
        var now = DateTime.UtcNow;

        // Ensure domain users for citizens exist. If no DomainUsers at all, create them.
        if (!await context.DomainUsers.AnyAsync(u => u.Role == UserRole.Citizen))
        {
            var citizens = CreateUsers(
                count: 10,
                role: UserRole.Citizen,
                usedEmails: usedEmails,
                usedPhones: usedPhones,
                now: now);

            await context.DomainUsers.AddRangeAsync(citizens);
            await context.SaveChangesAsync();
        }

        // Create Citizen records for any User with Role == Citizen that does not yet have a Citizen row.
        var citizenUsers = await context.DomainUsers.Where(u => u.Role == UserRole.Citizen).ToListAsync();
        var existingCitizenUserIds = new HashSet<Guid?>(await context.Citizens.Select(c => c.UserId).ToListAsync());

        // SA ID generator base (13 digits)
        long saIdBase = 9000000000000; // large starting number
        var existingSaIds = new HashSet<string>(await context.Citizens.Select(c => c.SaId).ToListAsync());

        var nameRnd = new Random(54321); // NOSONAR

        var genders = new[] { Gender.Male, Gender.Female, Gender.Other };

        var citizensToAdd = new List<Citizen>();
        foreach (var u in citizenUsers)
        {
            if (existingCitizenUserIds.Contains(u.Id)) continue;

            string saId;
            do
            {
                saId = saIdBase++.ToString();
            } while (existingSaIds.Contains(saId));
            existingSaIds.Add(saId);

            citizensToAdd.Add(new Citizen
            {
                Id = Guid.NewGuid(),
                SaId = saId,
                Names = FirstNames[nameRnd.Next(FirstNames.Length)],
                Surname = LastNames[nameRnd.Next(LastNames.Length)],
                DateOfBirth = now.AddYears(-nameRnd.Next(16, 70)).AddDays(-nameRnd.Next(0, 365)),
                Gender = genders[nameRnd.Next(genders.Length)],
                Status = CitizenStatus.Activated,
                ActivatedAt = now,
                UserId = u.Id,
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        if (citizensToAdd.Count > 0)
        {
            await context.Citizens.AddRangeAsync(citizensToAdd);
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedPendingCitizenActivationAsync(
    AppDbContext context)
    {
        const string testEmail =
            "pending.citizen@flashid.local";

        const string testSaId =
            "9901015009087";

        if (await context.CitizenActivations.AnyAsync(
                a => a.Email == testEmail))
        {
            return;
        }

        if (await context.Citizens.AnyAsync(
                c => c.SaId == testSaId))
        {
            return;
        }

        var now = DateTime.UtcNow;

        const string rawToken =
            "FLASHID-SEED-ACTIVATION-TOKEN";

        const string rawPin =
            "123456";

        var tokenBytes =
            Encoding.UTF8.GetBytes(rawToken);

        var tokenHash = Convert.ToHexString(
            SHA256.HashData(tokenBytes));

        var pinHash = BCrypt.Net.BCrypt.HashPassword(
            rawPin,
            workFactor: 12);

        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),

            SaId = testSaId,
            Names = "Pending",
            Surname = "Citizen",

            DateOfBirth = new DateTime(
                1999,
                1,
                1,
                0,
                0,
                0,
                DateTimeKind.Utc),

            Gender = Gender.Unspecified,

            Status = CitizenStatus.Pending,
            ActivatedAt = null,

            UserId = null,

            CreatedAt = now,
            UpdatedAt = now
        };

        var activation = new CitizenActivation
        {
            Id = Guid.NewGuid(),

            CitizenId = citizen.Id,

            Email = testEmail,
            PhoneNumber = null,

            TokenHash = tokenHash,
            PinHash = pinHash,

            Status = ActivationStatus.Pending,

            ExpiresAt = now.AddDays(30),

            AttemptCount = 0,
            LockedUntil = null,

            UsedAt = null,
            RevokedAt = null,
            RevokedReason = null,

            CreatedAt = now,
            UpdatedAt = now
        };

        await context.Citizens.AddAsync(citizen);
        await context.CitizenActivations.AddAsync(activation);

        await context.SaveChangesAsync();
    }

    private static async Task SeedOfficialUsersAsync(AppDbContext context, HashSet<string> usedEmails, HashSet<string> usedPhones)
    {
        var now = DateTime.UtcNow;

        // Ensure domain users for officials exist
        if (!await context.DomainUsers.AnyAsync(u => u.Role == UserRole.Official))
        {
            var officials = CreateUsers(
                count: 5,
                role: UserRole.Official,
                usedEmails: usedEmails,
                usedPhones: usedPhones,
                now: now);

            await context.DomainUsers.AddRangeAsync(officials);
            await context.SaveChangesAsync();
        }

        // Create Official records for users with that role if missing
        var officialUsers = await context.DomainUsers.Where(u => u.Role == UserRole.Official).ToListAsync();
        var existingOfficialUserIds = new HashSet<Guid>(await context.Officials.Select(o => o.UserId).ToListAsync());
        var existingOfficialIds = new HashSet<string>(await context.Officials.Select(o => o.OfficialId).ToListAsync());

        // Ensure we have institutions to attach officials to
        var institutions = await context.Institutions.ToListAsync();
        if (institutions.Count == 0)
        {
            // If no institutions exist, create a small default one registered by any gov admin (or a placeholder)
            var govAdmin = await context.GovernmentAdministrators.FirstOrDefaultAsync();
            var regBy = govAdmin?.Id ?? Guid.Empty;
            var inst = new Institution
            {
                Id = Guid.NewGuid(),
                Name = "Default Institution",
                Type = Domain.Enums.InstitutionType.LicensingDepartment,
                ApiKeyReference = Guid.NewGuid(),
                VerificationNumber = $"VER{DateTime.UtcNow.Ticks % 100000:00000}",
                RegisteredById = regBy,
                CreatedAt = now,
                UpdatedAt = now
            };
            await context.Institutions.AddAsync(inst);
            await context.SaveChangesAsync();
            institutions = await context.Institutions.ToListAsync();
        }

        var nameRnd = new Random(67890); // NOSONAR

        var officialsToAdd = new List<Official>();
        int offSeq = 1;
        int instIndex = 0;
        foreach (var u in officialUsers)
        {
            if (existingOfficialUserIds.Contains(u.Id)) continue;

            string officialId;
            do
            {
                officialId = $"OFF{offSeq:0000}";
                offSeq++;
            } while (existingOfficialIds.Contains(officialId));
            existingOfficialIds.Add(officialId);

            var assignedInst = institutions[instIndex % institutions.Count];
            instIndex++;

            officialsToAdd.Add(new Official
            {
                Id = Guid.NewGuid(),
                OfficialId = officialId,
                Names = FirstNames[nameRnd.Next(FirstNames.Length)],
                Surname = LastNames[nameRnd.Next(LastNames.Length)],
                CreatedAt = now,
                UpdatedAt = now,
                UserId = u.Id,
                InstitutionId = assignedInst.Id
            });
        }

        if (officialsToAdd.Count > 0)
        {
            await context.Officials.AddRangeAsync(officialsToAdd);
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedGovernmentAdministratorUsersAsync(AppDbContext context, HashSet<string> usedEmails, HashSet<string> usedPhones)
    {
        var now = DateTime.UtcNow;

        // Ensure domain users for gov admins exist
        if (!await context.DomainUsers.AnyAsync(u => u.Role == UserRole.GovernmentAdministrator))
        {
            var govAdmins = CreateUsers(
                count: 5,
                role: UserRole.GovernmentAdministrator,
                usedEmails: usedEmails,
                usedPhones: usedPhones,
                now: now);

            await context.DomainUsers.AddRangeAsync(govAdmins);
            await context.SaveChangesAsync();
        }

        // Create GovernmentAdministrator records for users with that role if missing
        var govUsers = await context.DomainUsers.Where(u => u.Role == UserRole.GovernmentAdministrator).ToListAsync();
        var existingGovUserIds = new HashSet<Guid>(await context.GovernmentAdministrators.Select(g => g.UserId).ToListAsync());
        var existingGovernmentIds = new HashSet<string>(await context.GovernmentAdministrators.Select(g => g.GovernmentId).ToListAsync());

        var nameRnd = new Random(11223); // NOSONAR

        var govAdminsToAdd = new List<GovernmentAdministrator>();
        int govSeq = 1;
        foreach (var u in govUsers)
        {
            if (existingGovUserIds.Contains(u.Id)) continue;

            string governmentId;
            do
            {
                governmentId = $"GOV{govSeq:0000}";
                govSeq++;
            } while (existingGovernmentIds.Contains(governmentId));
            existingGovernmentIds.Add(governmentId);

            govAdminsToAdd.Add(new GovernmentAdministrator
            {
                Id = Guid.NewGuid(),
                GovernmentId = governmentId,
                Names = FirstNames[nameRnd.Next(FirstNames.Length)],
                Surname = LastNames[nameRnd.Next(LastNames.Length)],
                CreatedAt = now,
                UpdatedAt = now,
                UserId = u.Id
            });
        }

        if (govAdminsToAdd.Count > 0)
        {
            await context.GovernmentAdministrators.AddRangeAsync(govAdminsToAdd);
            await context.SaveChangesAsync();
        }

        // Create a small set of institutions if none exist and assign RegisteredBy to random gov admins
        if (!await context.Institutions.AnyAsync())
        {
            var govAdminIds = (await context.GovernmentAdministrators.ToListAsync()).Select(g => g.Id).ToList();
            if (govAdminIds.Count == 0) return; // nothing to register institutions with

            var institutions = new List<Institution>();
            var instNames = new[] { "Home Affairs Cape Town", "Home Affairs Johannesburg", "Licensing Dept Pretoria", "Licensing Dept Durban", "Home Affairs Port Elizabeth" };
            int idx = 0;
            foreach (var name in instNames)
            {
                var inst = new Institution
                {
                    Id = Guid.NewGuid(),
                    Name = name,
                    Type = name.StartsWith("Licensing", StringComparison.Ordinal) ? InstitutionType.LicensingDepartment : InstitutionType.HomeAffairs,
                    ApiKeyReference = Guid.NewGuid(),
                    VerificationNumber = $"VER{DateTime.UtcNow.Ticks % 100000 + idx:00000}",
                    RegisteredById = govAdminIds[idx % govAdminIds.Count],
                    CreatedAt = now,
                    UpdatedAt = now
                };
                idx++;
                institutions.Add(inst);
            }

            await context.Institutions.AddRangeAsync(institutions);
            await context.SaveChangesAsync();
        }
    }

    private static IEnumerable<User> CreateUsers(
        int count,
        UserRole role,
        HashSet<string> usedEmails,
        HashSet<string> usedPhones,
        DateTime now)
    {
        var rnd = new Random(12345); // NOSONAR
        var phoneBase = 710000000; // will increment for unique numbers

        var created = 0;
        while (created < count)
        {
            var first = FirstNames[rnd.Next(FirstNames.Length)];
            var last = LastNames[rnd.Next(LastNames.Length)];

            // email: name.surname@flashid.local (lowercase)
            var emailBase = $"{first}.{last}".ToLowerInvariant();
            var email = emailBase + "@flashid.local";
            var emailSuffix = 1;
            while (usedEmails.Contains(email))
            {
                email = $"{emailBase}{emailSuffix}@flashid.local";
                emailSuffix++;
            }

            // phone +27 71 xxxxxxx style
            string phone;
            do
            {
                phone = $"+27{phoneBase++}"; // increment to ensure uniqueness
            } while (usedPhones.Contains(phone));

            usedEmails.Add(email);
            usedPhones.Add(phone);

            yield return new User
            {
                Id = Guid.NewGuid(),
                Email = email,
                PhoneNumber = phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                PasswordSet = true,
                FailedLoginAttempts = 0,
                LockoutUntil = null,
                LastLoginAt = null,
                IsDeleted = false,
                IsEmailVerified = true,
                Role = role,
                CreatedAt = now,
                UpdatedAt = now
            };

            created++;
        }
    }

    private static async Task SeedCredentialsAsync(AppDbContext context)
    {
        var now = DateTime.UtcNow;
        var rnd = new Random(99999); // NOSONAR

        // get all citizens that don't have a credential yet
        var citizensWithoutCredentials = await context.Citizens
            .Where(c => !context.Credentials.Any(cr => cr.CitizenId == c.Id))
            .ToListAsync();

        if (citizensWithoutCredentials.Count == 0) return;

        // get an official to use as IssuedBy
        var institutions = await context.Institutions.OrderBy(i => i.Name).ToListAsync();
        var idIssuer = institutions.FirstOrDefault(i => i.Type == InstitutionType.HomeAffairs)?.Name ?? "SYSTEM";
        var licenseIssuer = institutions.FirstOrDefault(i => i.Type == InstitutionType.LicensingDepartment)?.Name ?? "SYSTEM";

        var citizenships = new[] { "South African", "Zimbabwean", "Mozambican", "Namibian" };
        var nationalities = new[] { "South African", "Zimbabwean", "Mozambican", "Namibian" };
        var countries = new[] { "South Africa", "Zimbabwe", "Mozambique", "Namibia" };
        var idStatuses = new[] { IdentityDocumentStatus.Citizen, IdentityDocumentStatus.PermanentResident };
        var licenseCodes = new[] { LicenseCode.B, LicenseCode.EB };

        var credentialsToAdd = new List<Credential>();
        var identityDocsToAdd = new List<IdentityDocument>();
        var driversLicensesToAdd = new List<DriversLicense>();

        foreach (var citizen in citizensWithoutCredentials)
        {
            // age between 16 and 70
            // calculate exact age
            var age = now.Year - citizen.DateOfBirth.Year;
            if (citizen.DateOfBirth > now.AddYears(-age)) age--;

            var photoPath = citizen.Status == CitizenStatus.Activated ? MockPhotoBlobNames[rnd.Next(MockPhotoBlobNames.Length)] : string.Empty;
            var signature = citizen.Status == CitizenStatus.Activated ? "mock-photos-signature.png" : Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");

            var idCredential = NewCredential(citizen.Id, idIssuer, now, signature);
            credentialsToAdd.Add(idCredential);

            // every citizen 16+ gets an identity document
            identityDocsToAdd.Add(new IdentityDocument
            {
                Id = Guid.NewGuid(),
                Citizenship = citizenships[rnd.Next(citizenships.Length)],
                CountryOfBirth = countries[rnd.Next(countries.Length)],
                Nationality = nationalities[rnd.Next(nationalities.Length)],
                Status = idStatuses[rnd.Next(idStatuses.Length)],
                PhotoPath = photoPath,
                CredentialId = idCredential.Id,
                CreatedAt = now,
                UpdatedAt = now
            });

            // only citizens 18+ get a drivers license
            if (age >= 18)
            {
                var licenseCredential = NewCredential(citizen.Id, licenseIssuer, now, signature);
                var isExpired = rnd.Next(2) == 0;
                licenseCredential.Status = isExpired
                    ? CredentialStatus.Expired
                    : CredentialStatus.Active;
                credentialsToAdd.Add(licenseCredential);
                var startDate = isExpired
                    ? now.AddYears(-rnd.Next(6, 10))
                    : now.AddYears(-rnd.Next(0, 4));
                driversLicensesToAdd.Add(new DriversLicense
                {
                    Id = Guid.NewGuid(),
                    // LicenseNumber max 13 chars
                    LicenseNumber = Guid.NewGuid().ToString("N").Substring(0, 13).ToUpper(),
                    // LicenseCode max 3 chars - B or EB from enum
                    LicenseCode = licenseCodes[rnd.Next(licenseCodes.Length)],
                    // Restrictions max 2 chars
                    Restrictions = "00",
                    ExpiryDate = startDate.AddYears(5),
                    PhotoPath = photoPath,
                    CredentialId = licenseCredential.Id,
                    CreatedAt = now,
                    UpdatedAt = now
                });
            }
        }

        await context.Credentials.AddRangeAsync(credentialsToAdd);
        await context.SaveChangesAsync();

        await context.IdentityDocuments.AddRangeAsync(identityDocsToAdd);
        await context.SaveChangesAsync();

        if (driversLicensesToAdd.Count > 0)
        {
            await context.DriversLicenses.AddRangeAsync(driversLicensesToAdd);
            await context.SaveChangesAsync();
        }
    }
    private static Credential NewCredential(Guid citizenId, string issuedBy, DateTime now, string signature) => new()
    {
        Id = Guid.NewGuid(),
        Status = CredentialStatus.Active,
        Signature = signature,
        IssuedBy = issuedBy,
        IssueDate = now,
        CitizenId = citizenId,
        CreatedAt = now,
        UpdatedAt = now
    };
    private static async Task SeedUserPreferencesAsync(AppDbContext context)
    {
        var now = DateTime.UtcNow;
        var rnd = new Random(11111); // NOSONAR

        // get all users that don't have preferences yet
        // UserPreferences has unique index on UserId so one per user only
        var usersWithoutPreferences = await context.DomainUsers
            .Where(u => !context.UserPreferences.Any(up => up.UserId == u.Id))
            .ToListAsync();

        if (usersWithoutPreferences.Count == 0) return;

        var themes = new[] { Theme.Light, Theme.Dark, Theme.System };

        var citizenNames = await context.Citizens
            .Where(c => c.UserId.HasValue)
            .ToDictionaryAsync(c => c.UserId!.Value, c => c.Names);

        var officialNames = await context.Officials
            .ToDictionaryAsync(o => o.UserId, o => o.Names);

        var govAdminNames = await context.GovernmentAdministrators
            .ToDictionaryAsync(g => g.UserId, g => g.Names);

        var preferencesToAdd = usersWithoutPreferences.Select(u => new UserPreferences
        {
            Id = Guid.NewGuid(),
            // PreferredName max 100 chars
            PreferredName = u.Role switch
            {
                UserRole.Citizen => citizenNames.GetValueOrDefault(u.Id, string.Empty),
                UserRole.Official => officialNames.GetValueOrDefault(u.Id, string.Empty),
                UserRole.GovernmentAdministrator => govAdminNames.GetValueOrDefault(u.Id, string.Empty),
                _ => string.Empty
            },
            Theme = themes[rnd.Next(themes.Length)],
            PreferredDisclosure = rnd.Next(2) == 0,
            UserId = u.Id,
            CreatedAt = now,
            UpdatedAt = now
        }).ToList();

        await context.UserPreferences.AddRangeAsync(preferencesToAdd);
        await context.SaveChangesAsync();
    }

    private static async Task SeedAuditLogsAsync(AppDbContext context)
    {
        var now = DateTime.UtcNow;
        var rnd = new Random(22222); // NOSONAR

        if (await context.AuditLogs.AnyAsync()) return;

        var allUsers = await context.DomainUsers.ToListAsync();
        if (allUsers.Count == 0) return;

        var citizens = await context.Citizens.AsNoTracking().ToListAsync();

        var citizenEvents = new HashSet<AuditEventType>
        {
            AuditEventType.CredentialIssued,
            AuditEventType.CredentialVerified,
            AuditEventType.CredentialRevoked,
        };

        var eventDetails = new Dictionary<AuditEventType, string[]>
    {
        { AuditEventType.UserRegistered, new[] { "User registered via web portal", "User registered via mobile app" } },
        { AuditEventType.UserLoggedIn, new[] { "Successful login via web", "Successful login via mobile" } },
        { AuditEventType.FailedLoginAttempt, new[] { "Invalid password entered", "Account temporarily locked" } },
        { AuditEventType.CredentialIssued, new[] { "Identity document issued", "Drivers license issued" } },
        { AuditEventType.CredentialVerified, new[] { "Credential verified by official", "QR code scanned and verified" } },
        { AuditEventType.CredentialRevoked, new[] { "Credential revoked by administrator", "Credential revoked due to fraud" } },
        { AuditEventType.AccountDeleted, new[] { "Account deleted by user", "Account deleted by administrator" } }
    };

        var eventTypes = eventDetails.Keys.ToArray();
        var auditLogsToAdd = new List<AuditLog>();

        foreach (var user in allUsers)
        {
            var count = rnd.Next(2, 6);
            for (int i = 0; i < count; i++)
            {
                var eventType = eventTypes[rnd.Next(eventTypes.Length)];
                var details = eventDetails[eventType];
                var citizenId = citizenEvents.Contains(eventType) && citizens.Count > 0
                    ? citizens[rnd.Next(citizens.Count)].Id
                    : (Guid?)null;

                auditLogsToAdd.Add(new AuditLog
                {
                    Id = Guid.NewGuid(),
                    EventType = eventType,
                    Details = details[rnd.Next(details.Length)],
                    IpAddress = SampleIpAddresses[rnd.Next(SampleIpAddresses.Length)],
                    ActorId = user.Id,
                    CitizenId = citizenId,
                    CreatedAt = now.AddDays(-rnd.Next(0, 30))
                });
            }
        }

        await context.AuditLogs.AddRangeAsync(auditLogsToAdd);
        await context.SaveChangesAsync();
    }


    private static async Task SeedTrustedDevicesAsync(AppDbContext context)
    {
        var now = DateTime.UtcNow;
        var rnd = new Random(33344); // NOSONAR

        // only seed if no trusted devices exist yet
        if (await context.TrustedDevices.AnyAsync()) return;

        var allUsers = await context.DomainUsers.ToListAsync();
        if (allUsers.Count == 0) return;

        var deviceTemplates = new[]
        {
            new DeviceTemplate("Mobile", "iOS 18.1", "Safari"),
            new DeviceTemplate("Mobile", "Android 15", "Chrome"),
            new DeviceTemplate("Desktop", "macOS Sequoia", "Safari"),
            new DeviceTemplate("Desktop", "Windows 11", "Edge"),
            new DeviceTemplate("Tablet", "iPadOS 18.1", "Safari"),
            new DeviceTemplate("Desktop", "Windows 11", "Chrome"),
            new DeviceTemplate("Mobile", "Android 15", "Chrome"),
        };

        var locations = new[]
        {
            new LocationTemplate("Pretoria", "South Africa"),
            new LocationTemplate("Johannesburg", "South Africa"),
            new LocationTemplate("Cape Town", "South Africa"),
            new LocationTemplate("Durban", "South Africa"),
            new LocationTemplate("Bloemfontein", "South Africa"),
            new LocationTemplate("Gqeberha", "South Africa")
        };

        var devicesToAdd = new List<TrustedDevice>();

        void AddDevicesForCitizen(User citizen, int minDevices, int maxDevicesExclusive, int maxLastActiveDaysAgo, int trustedThreshold)
        {
            var deviceCount = rnd.Next(minDevices, maxDevicesExclusive);
            for (int i = 0; i < deviceCount; i++)
            {
                var template = deviceTemplates[rnd.Next(deviceTemplates.Length)];
                var location = locations[rnd.Next(locations.Length)];

                var seedDeviceToken = $"seed-device-{citizen.Id}-{i}";
                var deviceTokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(seedDeviceToken)));

                devicesToAdd.Add(new TrustedDevice
                {
                    Id = Guid.NewGuid(),
                    DeviceTokenHash = deviceTokenHash,
                    DeviceType = Enum.Parse<DeviceType>(template.DeviceType),
                    OperatingSystem = template.OperatingSystem,
                    Browser = template.Browser,
                    LastKnownCity = location.City,
                    LastKnownCountry = location.Country,
                    LastActive = now.AddDays(-rnd.Next(0, maxLastActiveDaysAgo)),
                    IsTrusted = rnd.Next(10) > trustedThreshold,
                    UserId = citizen.Id,
                    CreatedAt = now.AddDays(-rnd.Next(30, 365)),
                    UpdatedAt = now
                });
            }
        }



        var citizens = await context.Citizens.ToListAsync();
        // Prioritize Harper Miller (or any Harper/Miller match) with a fuller device history
        var priorityUsersId = citizens
            .Where(c => c.Names == "Harper" || c.Surname == "Miller").Select(c => c.UserId).ToHashSet();

        var priorityUsers = allUsers.Where(u => priorityUsersId.Contains(u.Id)).ToList();

        foreach (var citizen in priorityUsers)
        {
            AddDevicesForCitizen(citizen, minDevices: 3, maxDevicesExclusive: 5, maxLastActiveDaysAgo: 14, trustedThreshold: 1);
        }

        // Give the remaining citizens 1-3 devices each
        foreach (var citizen in allUsers.Where(c => !priorityUsers.Contains(c)))
        {
            AddDevicesForCitizen(citizen, minDevices: 1, maxDevicesExclusive: 4, maxLastActiveDaysAgo: 30, trustedThreshold: 2);
        }

        await context.TrustedDevices.AddRangeAsync(devicesToAdd);
        await context.SaveChangesAsync();
    }

    private static async Task SeedNotificationsAsync(AppDbContext context)
    {
        var now = DateTime.UtcNow;
        var rnd = new Random(44455); // NOSONAR

        // only seed if no notifications exist yet
        if (await context.Notifications.AnyAsync()) return;

        var allCitizens = await context.Citizens.ToListAsync();
        if (allCitizens.Count == 0) return;

        var notificationTemplates = new[]
        {
            new NotificationTemplate("Credential verified", "Your identity credential was successfully verified by an official.", "success"),
            new NotificationTemplate("New device signed in", "A new device was used to access your account. If this wasn't you, review your trusted devices.", "warning"),
            new NotificationTemplate("Drivers license renewal due", "Your drivers license is due for renewal within the next 30 days.", "info"),
            new NotificationTemplate("Profile updated", "Your account preferences were updated successfully.", "success"),
            new NotificationTemplate("Failed login attempt detected", "We noticed a failed login attempt on your account.", "warning"),
            new NotificationTemplate("Document upload complete", "Your supporting document was uploaded and is pending review.", "info"),
            new NotificationTemplate("Welcome to FlashID", "Your digital ID wallet is ready to use.", "success"),
        };

        var notificationsToAdd = new List<Notification>();

        void AddNotificationsForCitizen(Citizen citizen, int minCount, int maxCountExclusive, int maxDaysAgo)
        {
            var count = rnd.Next(minCount, maxCountExclusive);
            for (int i = 0; i < count; i++)
            {
                var template = notificationTemplates[rnd.Next(notificationTemplates.Length)];
                notificationsToAdd.Add(new Notification
                {
                    Id = Guid.NewGuid(),
                    CitizenId = citizen.Id,
                    Title = template.Title,
                    Description = template.Description,
                    Tone = template.Tone,
                    CreatedAt = now.AddDays(-rnd.Next(0, maxDaysAgo)),
                    IsRead = rnd.Next(2) == 0
                });
            }
        }

        var priorityCitizens = allCitizens
            .Where(c => c.Names == "Harper" || c.Surname == "Miller")
            .ToList();

        foreach (var citizen in priorityCitizens)
        {
            AddNotificationsForCitizen(citizen, minCount: 4, maxCountExclusive: 7, maxDaysAgo: 30);
        }

        foreach (var citizen in allCitizens.Where(c => !priorityCitizens.Contains(c)))
        {
            AddNotificationsForCitizen(citizen, minCount: 1, maxCountExclusive: 5, maxDaysAgo: 60);
        }

        await context.Notifications.AddRangeAsync(notificationsToAdd);
        await context.SaveChangesAsync();
    }
}