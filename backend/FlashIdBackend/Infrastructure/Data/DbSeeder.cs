using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

// DbSeeder runs at startup to ensure the database has:
//   1. Migrations applied
//   2. Seeded Citizens (140)
//   3. Seeded Officials (40)
//   4. Seeded Government Administrators (20)
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();
        // shared uniqueness trackers so users across roles don't collide
        var usedEmails = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var usedUsernames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var usedPhones = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        await SeedCitizenUsersAsync(context, usedEmails, usedUsernames, usedPhones);
        // Government administrators must exist before creating institutions or officials
        await SeedGovernmentAdministratorUsersAsync(context, usedEmails, usedUsernames, usedPhones);
        await SeedOfficialUsersAsync(context, usedEmails, usedUsernames, usedPhones);
    }

    private static async Task SeedCitizenUsersAsync(AppDbContext context, HashSet<string> usedEmails, HashSet<string> usedUsernames, HashSet<string> usedPhones)
    {
        var now = DateTime.UtcNow;

        // Ensure domain users for citizens exist. If no DomainUsers at all, create them.
        if (!await context.DomainUsers.AnyAsync(u => u.Role == UserRole.Citizen))
        {
            var citizens = CreateUsers(
                count: 140,
                role: UserRole.Citizen,
                usedEmails: usedEmails,
                usedUsernames: usedUsernames,
                usedPhones: usedPhones,
                now: now);

            await context.DomainUsers.AddRangeAsync(citizens);
            await context.SaveChangesAsync();
        }

        // Create Citizen records for any User with Role == Citizen that does not yet have a Citizen row.
        var citizenUsers = await context.DomainUsers.Where(u => u.Role == UserRole.Citizen).ToListAsync();
        var existingCitizenUserIds = new HashSet<Guid>(await context.Citizens.Select(c => c.UserId).ToListAsync());

        // SA ID generator base (13 digits)
        long saIdBase = 9000000000000; // large starting number
        var existingSaIds = new HashSet<string>(await context.Citizens.Select(c => c.SaId).ToListAsync());

        var citizensToAdd = new List<Citizen>();
        foreach (var u in citizenUsers)
        {
            if (existingCitizenUserIds.Contains(u.Id)) continue;

            string saId;
            do
            {
                saId = (saIdBase++).ToString();
            } while (existingSaIds.Contains(saId));
            existingSaIds.Add(saId);

            citizensToAdd.Add(new Citizen
            {
                Id = Guid.NewGuid(),
                SaId = saId,
                ActivationCode = Guid.NewGuid().ToString("N").Substring(0, 8),
                ActivationCodeExpiresAt = now.AddDays(7),
                IsActivated = true,
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

    private static async Task SeedOfficialUsersAsync(AppDbContext context, HashSet<string> usedEmails, HashSet<string> usedUsernames, HashSet<string> usedPhones)
    {
        var now = DateTime.UtcNow;

        // Ensure domain users for officials exist
        if (!await context.DomainUsers.AnyAsync(u => u.Role == UserRole.Official))
        {
            var officials = CreateUsers(
                count: 40,
                role: UserRole.Official,
                usedEmails: usedEmails,
                usedUsernames: usedUsernames,
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

    private static async Task SeedGovernmentAdministratorUsersAsync(AppDbContext context, HashSet<string> usedEmails, HashSet<string> usedUsernames, HashSet<string> usedPhones)
    {
        var now = DateTime.UtcNow;

        // Ensure domain users for gov admins exist
        if (!await context.DomainUsers.AnyAsync(u => u.Role == UserRole.GovernmentAdministrator))
        {
            var govAdmins = CreateUsers(
                count: 20,
                role: UserRole.GovernmentAdministrator,
                usedEmails: usedEmails,
                usedUsernames: usedUsernames,
                usedPhones: usedPhones,
                now: now);

            await context.DomainUsers.AddRangeAsync(govAdmins);
            await context.SaveChangesAsync();
        }

        // Create GovernmentAdministrator records for users with that role if missing
        var govUsers = await context.DomainUsers.Where(u => u.Role == UserRole.GovernmentAdministrator).ToListAsync();
        var existingGovUserIds = new HashSet<Guid>(await context.GovernmentAdministrators.Select(g => g.UserId).ToListAsync());
        var existingGovernmentIds = new HashSet<string>(await context.GovernmentAdministrators.Select(g => g.GovernmentId).ToListAsync());

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
        HashSet<string> usedUsernames,
        HashSet<string> usedPhones,
        DateTime now)
    {
        var firstNames = new[] {
            "Liam","Noah","Ethan","Mason","Logan","James","Oliver","Benjamin","Elijah","Lucas",
            "Mia","Emma","Olivia","Ava","Isabella","Sophia","Charlotte","Amelia","Harper","Evelyn",
            "Thabo","Sipho","Nkosi","Sizwe","Lungelo","Bongani","Kgosi","Kayla","Zanele","Nomsa",
            "Amogelang","Tshepo","Kagiso","Lesedi","Palesa","Neo","Mpho","Tendai","Kabelo","Sibusiso",
            "Zinhle","Mandla","Andile","Zuko","Nosipho","Lerato","Mbali","Nokuthula","Xolani","Sizweleo",
            "Daniel","Samuel","Jacob","Michael","William","Alexander","Henry","Sebastian","Levi","Mateo",
            "Anele","Fikile","Yandiswa","Nokwanda","Sanele","Khanya","Thandolwethu","Busi","Karabo","Pule"
        };

        var lastNames = new[] {
            "Ngata","Chisadza","Mokoena","Dlamini","Naidoo","Sithole","Botha","VanDerMerwe","Nkosi","Khumalo",
            "Mafolo","Mabena","Mkhize","Maseko","Mabuza","Matsheka","Morrell","Meyer","VanWyk","Kruger",
            "Smith","Johnson","Brown","Williams","Jones","Miller","Wilson","Anderson","Thomas","Taylor",
            "Patel","Khan","Singh","Naidoo","Pillay","Govender","Perumal","Singh","Mahlangu","Radebe",
            "Swanepoel","Botha","VanHeerden","Gumede","Mthembu","Mabuyi","Magubane","Mabutho","Mntambo","Mdluli"
        };

        var rnd = new Random(12345);
        var phoneBase = 710000000; // will increment for unique numbers

        var created = 0;
        while (created < count)
        {
            var first = firstNames[rnd.Next(firstNames.Length)];
            var last = lastNames[rnd.Next(lastNames.Length)];

            // email: name.surname@flashid.local (lowercase)
            var emailBase = $"{first}.{last}".ToLowerInvariant();
            var email = emailBase + "@flashid.local";
            var emailSuffix = 1;
            while (usedEmails.Contains(email))
            {
                email = $"{emailBase}{emailSuffix}@flashid.local";
                emailSuffix++;
            }

            // username variants: nameInitialsurname | namesurnameInitial | name_surname
            string username;
            var pattern = rnd.Next(3);
            switch (pattern)
            {
                case 0:
                    username = $"{first}{last[0]}"; // e.g. JohnD
                    break;
                case 1:
                    username = $"{first}{last}{first[0]}"; // e.g. JohnDoeJ
                    break;
                default:
                    username = $"{first}_{last}"; // e.g. John_Doe
                    break;
            }

            var unameBase = username;
            var unameSuffix = 1;
            while (usedUsernames.Contains(username))
            {
                username = unameBase + unameSuffix;
                unameSuffix++;
            }

            // phone +27 71 xxxxxxx style
            string phone;
            do
            {
                phone = $"+27{phoneBase++}"; // increment to ensure uniqueness
            } while (usedPhones.Contains(phone));

            usedEmails.Add(email);
            usedUsernames.Add(username);
            usedPhones.Add(phone);

            yield return new User
            {
                Id = Guid.NewGuid(),
                Names = first,
                Surname = last,
                Email = email,
                PhoneNumber = phone,
                Username = username,
                PasswordHash = "password123",
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
}