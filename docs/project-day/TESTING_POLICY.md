# FlashID Testing Policy

**Tech Titans, COS 301 Capstone 2026**

---

### 1.Purpose

This document defines the standards, procedures and responsibilities associated with software testing for FlashID, the South African Digital ID Wallet. It estabishes a consistent approach to planning, executing, documenting, and reviewing activitiess across all services (backend, government-registry, web, mobile) to ensure software quality, realibility, and compliance with project requirements -including POPIE-driven data handling rules and identity-verification security guarantees. 
---

## 2. Testing Objectives

- Verify that each service (backend, government-registry, web frontend, mobile) behaves correctly in isolation and in combination with its real dependencies.
- Guarantee the integrity of identity-critical flows: citizen registration, credential activation, QR generation/selective disclosure, and credential verification.
- Enforce security-sensitive invariants through tests, not just code review - e.g. QR token replay protection, credential revocation handling, and audit log correctness.
- Catch regressions automatically before merge via CI, rather than relying on manual testing.
- Maintain sufficient coverage on new code so that untested logic doesn't silently reach dev or a demo build

---

## 3. Testing Types

| Type | Definitions | Where Used|
|---|---|---|
| **Unit Test** | Tests a single function, class, or component in complete isolation. All external dependencies (DB, API, other services) are mocked. No network or DB access. | Backend validators/services (xUnit), frontend components/services (Jest + RTL), government-registry services |
| **Component Test** | Tests a React component in isolation using a fake browser environment (jsdom). No real HTTP calls , even if the component uses React Query hooks. | Web frontend (e.g. register-institution-form.test.tsx, button.test.tsx) |
| **Integration Test** | Tests multiple real layers working together - for backend, a real (in-memory or SQLite) database; for government-registry, full controller-to-DB flow via WebApplicationFactory. No mocking of the system under test itself. | BackendIntegrationTests.cs, QrServiceIntegrationTests.cs, government-registry's ControllerIntegrationTests.cs |
| **E2E** | Tests the full application in a real browser with a real backend and  database, simulating an actual user's click-through flow | Playwright specs in web/e2e/test/ |

---

## 4. Tools and Environments

| Layer | Framework/Tool | Notes |
|---|---|---|
| Backend (FlashID) unit + integration | xUnit v3 | dotnet test, in-memory EF Core DB and SQLite in-memory connection used for integration tests |
| Government-registry unit + integration | xUnt | Separate service, tested independently - controller, repository, and service layers all covered |
| Frontend unit/component | Jest + React Testing Library | npx jest --coverage , jsdom environment, QueryClientProvider wrapper required for React Query components |
| E2E | Playwright | 6 specs: auth (via auth.setup.ts global login), activate-credentials, citizen-dashboard, manage-user-account, qr-generation, qr-scanning, view-credentials|
| Coverage reporting | ReportGenerator (backend), Codecov (all layers) | dotnet-reportgenerator-globaltool; Cobertura XML uploaded to Codecov per PR |
| Code quality gate | SonarCloud | Quality Gate on new code, covering Security Rating, Reliability Rating, and duplication |
| CI/CD | GitHub Actions | backend.yml, web.yml, mobile.yml, plus government-registry and Web E2E workflows -all run automatically on every PR |

---

## 5. What Gets Tested

**Backend / government-registry:**
- Validators - every rule (empty, too long, invalid format, valid input)
- Services - business logic, with dependencies mocked (unit) or real (integration)
- Controllers - HTTP response codes for success and failure paths
- Security-critical behavior -e.g. QR token single-use enforcement, credential status checks blocking revoked/expired credentials, audit log writes on login/logout/verification events

**Frontend:**
- Components - correct rendering, correct response to user interaction, correct state transitions
- Services - DTO/model field mapping, URL construction
- Config - navigation completeness (non-empty hrefs, required nav items per portal)

**E2E:**
- Full user journeys: citizen login to dashboard to credential view to QR generation to verifier scan/resolve to account management

---

## 6. Naming Conventions

- Backend/government-registry unit: `{ClassName}Tests.cs`
- Backend/government-registry integration: `{ClassName}IntegrationTests.cs`
- Frontend: `{filename}.test.tsx` (components) / `{filename}.test.ts`(services, config, utils)
- E2E: `{flow-name}.spec.ts`
- Test method naming:`MethodName_Condition_ExpectedResult`


---

## 7. Acceptance Criteria (Merge Gate)

A pull request is ready to merge when all of the following pass:

- **Backend CI / Build and Test** :all backend unit + integration tests pass
- **Government Registry CI / Build and Test** : all government-registry unit + integration tests pass
- **Web CI / Build and Test**: all frontend unit/component tests pass
- **Web E2E / Playwright E2E** :all 6 Playwright specs pass
- **Codecov/patch** : new code meets the current patch coverage target (77.61%)
- **SonarCloud Code Analysis - Quality Gate passed**, specifically requiring:
  - Security Rating on New Code >=A
  - Reliability Rating on New Code >=A
- **At least 1 approving review** from a reviewer with write access

Our convention is: If any check fails -e.g. SonarCloud flags a B security or C reliability rating on new code-the PR is blocked from merging until it's resolved, regardless of whether the other checks are green.

---

## 8.Defect Management Process

FlashID does not use a formal bug-tracking system or severity classification. When a defect is found (during testing, manual QA, or demo prep):

- If the person who finds it understands the issue and can fix it directly, they do so imediately rather than logging it and waiting.
- If the fix touches a feature they don't own or don't fully understand, they raise it with the feature owner directly - either via WhatsApp or during the team's Discord daily standup.
- There is no severity tagging (blocker/major/minor); defects are simply fixed as they're found, prioritizing whatever is blocking the current PR, CI run, or demo.

---

## 9. Roles and Responsibilities

Feature author -Writes unit/integration tests for their own feature in the same PR (or an immediate follow-up testing PR) 

Reviewer -Confirms new code has adequate test coverage and CI/SonarCloud/Codecov checks pass before approving

Any team member-May fix a defect directly upon discovery, or flag the feature owner via WhatsApp/Discord standup if unfamiliar with the code

There is no dedicated QA role- testing responsibility is fully distributed across the team, per feature.