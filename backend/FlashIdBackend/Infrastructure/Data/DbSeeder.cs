using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

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
//
// NOTE: Biometrics seeding is intentionally skipped.
// Biometrics stores cryptographic hashes (FaceHash, FingerprintHash) of real
// biometric data. Seeding fake hashes would be misleading and could cause
// issues when the actual biometric hashing feature is implemented.
// Biometrics will be seeded once the facial recognition and fingerprint
// scanning features are built out.
public static class DbSeeder
{
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

    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();
        // shared uniqueness trackers so users across roles don't collide
        var usedEmails = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var usedPhones = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        await SeedCitizenUsersAsync(context, usedEmails, usedPhones);
        // Government administrators must exist before creating institutions or officials
        await SeedGovernmentAdministratorUsersAsync(context, usedEmails, usedPhones);
        await SeedOfficialUsersAsync(context, usedEmails, usedPhones);
        await RepairInvalidPasswordHashesAsync(context);
        await SeedCredentialsAsync(context);
        await SeedUserPreferencesAsync(context);
        await SeedAuditLogsAsync(context);
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
                CredentialActivationCode = null,
                CredentialActivationCodeExpiresAt = null,
                Status = CitizenStatus.Activated,
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
                    Type = Domain.Enums.InstitutionType.HomeAffairs,
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
        var official = await context.Officials.FirstOrDefaultAsync();
        var issuedBy = official?.Id.ToString() ?? "SYSTEM";

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

            var credential = new Credential
            {
                Id = Guid.NewGuid(),
                Status = CredentialStatus.Active,
                // Signature max 1024 - use a guid based string
                Signature = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N"),
                // IssuedBy max 256
                IssuedBy = issuedBy,
                IssueDate = now,
                CitizenId = citizen.Id,
                CreatedAt = now,
                UpdatedAt = now
            };
            credentialsToAdd.Add(credential);

            // every citizen 16+ gets an identity document
            identityDocsToAdd.Add(new IdentityDocument
            {
                Id = Guid.NewGuid(),
                Citizenship = citizenships[rnd.Next(citizenships.Length)],
                CountryOfBirth = countries[rnd.Next(countries.Length)],
                Nationality = nationalities[rnd.Next(nationalities.Length)],
                Status = idStatuses[rnd.Next(idStatuses.Length)],
                CredentialId = credential.Id,
                CreatedAt = now,
                UpdatedAt = now
            });

            // only citizens 18+ get a drivers license
            if (age >= 18)
            {
                var startDate = now.AddYears(-rnd.Next(1, 10));
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
                    CredentialId = credential.Id,
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

        // only seed if no audit logs exist yet
        if (await context.AuditLogs.AnyAsync()) return;

        var allUsers = await context.DomainUsers.ToListAsync();
        if (allUsers.Count == 0) return;

        // sample IP addresses
        var ipAddresses = new[]
        {
        "102.130.10.1", "196.11.240.5", "41.21.100.3",
        "154.0.5.22", "196.25.200.8", "41.113.10.14",
        "102.65.30.9", "196.15.45.7", "41.205.20.11"
    };

        // sample details per event type
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
            // give each user 2-5 audit log entries
            var count = rnd.Next(2, 6);
            for (int i = 0; i < count; i++)
            {
                var eventType = eventTypes[rnd.Next(eventTypes.Length)];
                var details = eventDetails[eventType];

                auditLogsToAdd.Add(new AuditLog
                {
                    Id = Guid.NewGuid(),
                    EventType = eventType,
                    // Details is nvarchar(max) so no length limit
                    Details = details[rnd.Next(details.Length)],
                    // IpAddress max 45 chars
                    IpAddress = ipAddresses[rnd.Next(ipAddresses.Length)],
                    ActorId = user.Id,
                    CreatedAt = now.AddDays(-rnd.Next(0, 30))
                });
            }
        }

        await context.AuditLogs.AddRangeAsync(auditLogsToAdd);
        await context.SaveChangesAsync();
    }

}