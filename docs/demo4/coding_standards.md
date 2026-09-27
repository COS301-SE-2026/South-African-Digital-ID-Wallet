# FlashID - Coding Standards

**Tech Titans | COS 301 Capstone**

This document describes the conventions, styles, file structure, and tooling configuration that keep the FlashId codebase uniform, readable and maintainable across all 3 applications (backend, web, mobile) and across all contributors.

---

## 1. Repository Structure

FlashID makes use of a monorepo file structure. The backend, web and mobile projects all live in Git repository, each in its own top-level folder. This gives a single source of truth for cross-cutting PRs, one CI/CD configuration surface and one place for assessors to see the whole system.

```
South-African-Digital-ID-Wallet/
├── backend/                        ASP.NET Core Web API (.NET 10) - Clean Architecture
│   └── FlashIdBackend/
│       ├── FlashIdBackend.sln
│       ├── Domain/                 Entities, enums, business rules - no framework dependencies
│       ├── Application/            Services, DTOs, validators, interfaces, mappers, exceptions
│       ├── Infrastructure/         EF Core DbContext, migrations, provider implementations
│       ├── Presentation/           Controllers, middleware, JWT/auth config, Program.cs
│       └── tests/                  xUnit test project
│
├── web/                             Next.js 16 + React 19 (TypeScript), citizen/official/gov-admin portals
│   └── src/
│       ├── app/                    Next.js App Router routes (route groups: (auth)/, (portal)/)
│       ├── components/             Atomic design: atoms/ molecules/ organisms/ pages/
│       ├── assets/                 Images and static assets
│       └── lib/                    Shared utilities (e.g. cn() helper)
│
├── mobile/                          Expo + React Native (TypeScript)
│   └── src/
│       ├── app/                    expo-router routes
│       └── components/             Same atomic design levels as web: atoms/ molecules/ organisms/ templates/
│
├── docs/                            SRS, architecture, API docs, this document, etc.
├── .github/workflows/               One CI workflow per app, scoped by path filter
├── lefthook.yml                     Pre-commit hooks (lint, format, build) per app
├── pnpm-workspace.yaml               web/ + mobile/ + backend/ as pnpm workspace packages
└── package.json                     Root scripts that fan out to each app (dev, build, lint, test, format) 
```

Each application folder has its own CI workflow that only triggers when files under that folder change.

---

## 2. General Principles

- **Clean Architecture on the backend.** Dependencies point inward only:
    - Presentation depends on Application.
    - Infrastructure depends on Application and Domain. It implements Application's interfaces.
    - Application depends on Domain.
    - Domain is independent.
- **Atomic design on the frontend.** UI is built bottom-up. Atoms, then molecules, then organisms, then pages.
- **Depend on interfaces, not concrete classes,** on the backend. Every service, repository, provider is injected via its interface and wired up in a dependency injection. 
- **Keep controllers thin.** Business logic lives in services, data access in repositories, validation in validators and mapping in mappers.
- **Don't build for hypotheticals.** No extra configuration, error handling, or abstraction for cases the system does not actually have.
- **Citizen data is sensitive.** POPIA consideration come before convenience when the tow conflict.

---

## 3. Git & version control

### 3.1. Branching

| Type | Description | Example |
| --- | --- | --- |
| main | Protected, demo-ready code only. CI has to pass. 2 approvals to merge. No direct or force pushes. | - |
| dev | Protected. Integration branch. CI has to pass 1 approval to merge. No direct of force pushes. | - |
| feature/* | new functionality | feature/backend-jwt-auth |
| fix/* | bug fixes | fix/qr-signature-mismatch |
| chore/* | tooling/configurations/dependency work | chore/ci=github-actions |
| docs/* | documentation changes | docs/coding-standards |

### 3.2. Pull requests

- Branch off dev. Only merge dev into main when a sprint is demo ready.
- CI has to be green before a PR can merge.
- Keep PRs focused. E.g. Do not bundle unrelated refactor into a bug fix.

---

## 4. Backend (.NET/C#)

### 4.1 Layers

| Layer | Can refernce | Holds |
| --- | --- | --- |
| Domain | nothing | Entities, enums, business rules, no EF Core, plain C# |
| Application | Domain | Services, DTOs, validators, interfaces, mappers, typed exceptions |
| Infrastructure | Domain, Application | DBContext, EF Core-specific, migrations, provider implementations |
| Presentation | Application | Controllers, middleware, Program.cs |

Program.cs is the only place a concrete class gets wired to an interface.
DBContext and anything EF Core specific never leaks into Application.

### 4.2. Naming

| Topic | Convention | Example |
| --- | --- | --- |
| Classes, Methods, Properties | PascalCase | CitizenService |
| Interfaces | I + PascalCase | ICitizenService |
| Private fields | _camelCase | _citizenRepository |
| Async methods | Async suffix | GetUserByEmailAsync |
| Request & Response DTOs | <Verb\><Feature\>Request/ResponseDto | RegisterInstitutionRequestDto |
| Exceptions | <Feature\>Exceptions | InstitutionExceptions |

Organise DTOs and Exceptions by **feature**,  under Application/Features/<Feature\>/{DTOs/Exceptions}.
Services, validators, mappers and interfaces are organised by **role**, under Application/Common/{Services/Validation/Mapping/Interfaces}. The interface role is split even further into RepositoryInterfaces, ServiceInterfaces and ProviderInterfaces.

### 4.3. Dependency Injection

- Constructor injection, always. Dependencies are readonly fields set in the constructor.
- Default timeline is Scoped. Singleton is only for things that are stateless such as the Mapperly mappers.
- Do not **new()** up a service inside another service. Inject it.

### 4.4. Mapping

- Mapperly is used for entity to DTO mapping, and vice-versa. One partial mapper class per feature, registered as a singleton since they are stateless.
- Never map Entity to an Entity. Mapping only happens at the Domain/Application boundary with the API.
- Mismatched property names get [MapProperty].

### 4.5. Data Access

- All EF Core usage **(DbContext, DbSet<T\>, LINQ)** stay inside repository implementations in **Infrastructure/Data**. Services only ever see the repository interface can never interact with the database directly.
- **AsNoTracking()** on anything read-only. Only track what you are actually going to mutate and save.
- Use **Include/ThenInclude** for related data. Lazy loading is not turned on.
- Schema changes go through EF Core migrations **(dotnet ef migrations add <Name\>)**, commited under **Infrastructure/Migrations/**. if a migration's already been applied somewhere, do not edit it, just add a new one.
- Table/column configuration lives in **IEntityTypeConfiguration<T\>** classes under **Infrastructure/Data/Configurations/**, not as attributes on the entities. This keeps **Domain** clean of EF Core.

### 4.6. Validation & Exceptions

- Validation lives in static classes under **Application/Common/Validation/**, and are called at the top of the relevant service method.
- Validators throw typed exceptions scoped to the feature instead of generic ones, so the Presentation layer can map them to the right HTTP status in one place.
- Auth failures return the same generic message regardless of whether the account exists or the password was wrong. This is so attackers so not have a way to enumerate accounts.

### 4.7. Testing

- **xUnit**, under **backend/FlashIdBackend/tests/**. one test class per thing being tested.
- Test names follow **MethodName_Scenario_Expectedresult**.
- **pnpm test:backend** runs them, **pnpm test:backend:coverage** runs with coverage (Cobertura), tracked in Codecov.

### 4.8. Formatting

- **dotnet format** handles formatting **(pnpm format:backend)**; CI and pre-commit check with **dotnet format --verify-no-changes (pnpm lint:backend)**.
- Build **(dotnet build)** has to success clean before merge.

---

## 5. Frontend (Web & Mobile)

Web and mobile share the same components architecture, Typescript conventions and formatting rules:
- web/ (Next.js 16 + React 19)
- mobile/ (Expo + React Native)

### 5.1. Component Structure

```
components/
├── atoms/         smallest building blocks (Button, Text, StatusPill)
├── molecules/      built from atoms (TextField, Dropdown, AccountCard)
├── organisms/       built from molecules (AppSidebar, RegisterInstitutionForm)
├── templates/        layout shells (mobile) / layout.tsx (web)
└── pages/             route-level assemblies (ViewInstitutionsPage, OnboardCitizenPage)
```

Every component gets its own **kebab-case** folder:

```
button/
├── button.tsx      the component
├── types.ts         exported prop types
├── index.ts          barrel: export * from './button'; export * from './types'
└── test/
    └── button.test.tsx
```

### 5.2. Naming
| Topic | Convention | Example |
| --- | --- | --- |
| Component folders/files | kebab-case | account-info-row |
| Component names | PascalCase | export const Button:FC<ButtonPropsType\> |
| Prop types | PascalCase + PropsType | ButtonPropsType |
| Variant/union types | PascalCase, no suffix | ButtonVariant |
| Hooks | camelCase, use prefix | useAuth |
| Tests | under test/, *.test.tsx | test/button.test.tsx |

### 5.3. State

- **Server state** (anything fetched from the API) goes through TanStack Query. Do not duplicate it into local state or a store.
- **Client/UI state** (session, theme, UI flags) - **Zustand**.
- **Forms** (react-hook-form) + Zod, wired through **@hookform/resolvers**.

### 5.4. Styling

- Tailwind v4 utility classes. Conditional classes go through the **cn()** helper (clsx + tailwind-merge) in **lib/utils**.
- Colours are Tailwind theme tokens **(deep-green, clean-white, neutral-mid-gray, etc)**. Do not hardcode hex values in components.
- Build on **Radix UI/shadcn** primitives rather than writing your own from scratch.

### 5.5. Testing

- **Jest + React Testing Library** for components, one **'\*.test.tsx'** per component in its own **'test/'** folder
- **Playwright** for End-2-End testing (web).
- **pnpm test:web / pnpm test:mobile**, or the **:coverage** variants (tracked in Codecov).

---

## 6. Formatting & linting configuration

**Prettier** 

- **web/.prettierrc, mobile/.prettierrc** - Same for both.
- No semicolons, single quotes, 2-spac indent, 80 char lines

**ESLint**

- Web: **eslint-config-next** (core-web-vitals + typescript) + **eslint-config-prettier** to turn off anything Prettier already handles (web/eslint.config.mjs)
- Mobile: **eslint-config-expo** (flat config) + **eslint-config-prettier** (**mobile/eslint.config.mjs**)
- **pnpm lint:web / pnpm lint:mobile** auto-fix; **lint:check** variants (no --fix) run in CI

**Typescript**

- strict mode on for both. No implicit any.
- pnpm type-check:web / pnpm type-check:mobile (tsc --noEmit).

---

## 7. CI/CD & quality gates

### 7.1. Pre-commit (lefthook.yml). 

Runs before every commit, scoped by folder:

| App | What runs |
| --- | --- |
| web/\*\*/\*.{ts,tsx,js,jsx} | lint(fix + restage), format (fix + restage), build (skipped on merge/rebase/cherry-pick) |
| mobile/\*\*/\*.{ts,tsx,js,jsx} | lint, format, type-check, build (skipped on merge/rebase/cherry-pick) |
| backend/FlashIdBackend/\*\*/\*.cs | dotnet format (fix + restage), dotnet format --verify-no-changes, dotnet build (skipped on merge/rebase/cherry-pick) |

### 7.2. GitHub Actions

As stated before, each app has its own workflow **(backend.yml, web.yml, mobile.yml)**. They are path-filtered so it only runs when that app's files change, plus separate deploy workflows for dev/staging/prod. Branch protection on **main** and **dev** means a PR can not merge until its workflow is green.

### 7.3. Root Scripts

The root **package.json** fans out to every workspace **(pnpm dev, pnpm build, pnpm test, pnpm lint, pnpm format, pnpm type-check, etc...)**. They all run across all three apps, alongside the per-app **'\*:web' / '\*:mobile' / '\*:backend'** scripts.

---

## 8. Environment & secrets

- **appsettings.json** is commited and only holds non-sensitive structural defaults.
- **appsetings.Development.json**, **appsettings.Staging.json** and **appsettings.Production.json** are never commited. They hold real connection strings, Key Vault URLs and storage account names, generated by GitHub Actions from repo secrets at deploy time.
- ASPNETCORE_ENVIRONMENT is set in Azure App Services (not in code) and decides which overlay file gets merged on top of the base config.
- If a secret does end up commited by accident, rotate it immediately. Do not jst remove it in a later commit as Git history never forgets.

---

## 9. Comments & docs

- Default to no comments. Allowed comments:
    - The *why*: a non-obvious business rule, a workaround, something that would generally surprise the next reader
    - Complicated logic: If code can be confusing, explanatory comments are allowed. Will be removed at a later stage.
- Do not restate what the code already says, and do not reference a specific PR/issure in a comment. That belongs in the commit message, not the source.
- Keep the rest of docs/ current alongside this file. 

---