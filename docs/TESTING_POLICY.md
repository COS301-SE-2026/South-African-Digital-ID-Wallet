# FlashID Testing Policy
**Tech Titans · COS 301 Capstone 2026**

> This document defines what testing is *required* before code merges. For how to write tests, see [TESTING.md](./TESTING.md).

---

## 1. Purpose & Scope

This policy applies to all four services in the monorepo: `backend`, `government-registry`, `web`, and `mobile`. It governs what must pass in CI before a PR can merge, and what test coverage is expected of new code.

---

## 2. Required checks per service

CI is wired per-service via path-filtered GitHub Actions workflows, triggered on PRs and pushes to `main` and `dev`.

| Service | Workflow | Trigger | Required for merge |
|---|---|---|---|
| Backend | `backend.yml` | PR/push touching `backend` | `dotnet test` must pass (unit + integration tests in `backend/FlashIdBackend/tests/`) |
| Government Registry | `gov_registry.yml` | PR/push touching `government-registry` | `dotnet test` must pass |
| Web | `web.yml` | PR/push touching `web` | `pnpm run test:web:coverage` must pass |
| Web E2E | `web-e2e.yml` | PR touching `web` **or** `backend` | Playwright suite must pass against a real backend + ephemeral SQL Server |
| Mobile | `mobile.yml` | PR/push touching `mobile` | `pnpm test -- --coverage` must pass |

A PR that touches both `web` and `backend` must pass all four relevant workflows (web unit, backend unit, web-e2e, and backend if changed) and not just the ones for the code it directly edited, since `web-e2e.yml` gates on either path.

---

## 3. Definition of done (test-related)

A PR is not complete unless:

- **New backend logic** (validator, service, controller) ships with a unit test in `backend/FlashIdBackend/tests/`, following the `{Something}Tests.cs` convention. If it touches the database, it also needs an integration test.
- **New frontend components/services** ship with a test under `test/{name}.test.tsx|ts` next to the file.
- **New user-facing flows spanning web + backend** get a Playwright spec added to `web/e2e/test/`, reusing the role-based auth setup in `web/e2e/auth.setup.ts` rather than re-authenticating per test.
- **New mobile logic** ships with a test under `mobile/src/__tests__/`.
- **Government Registry** is a known exception.

No PR should reduce test coverage on the files it touches without a stated reason in the PR description.

---

## 4. Coverage reporting

Codecov runs on every backend, web, mobile, and government-registry PR (`codecov/codecov-action@v5`), uploading per-service coverage reports. `codecov.yml` only defines an ignore list (EF migrations, `DbSeeder.cs`, `Program.cs` for both `.NET` services). Also it does not set a committed patch-coverage target. Any pass/fail coverage threshold shown on a PR comes from the Codecov dashboard project settings, not from a file in this repo.

The upload step uses `fail_ci_if_error: false`, meaning a Codecov outage will not fail the build and the test run itself is still the actual gate.

---

## 5. Known policy gaps (Will fix these in the coming Demo 3)

Documenting these honestly rather than implying full coverage:

- **Government Registry has no real tests.** `government-registry/GovernmentRegistry/tests/` only contains the scaffolded `UnitTest1.cs`, even though `gov_registry.yml` runs `dotnet test` on every PR. The check currently passes trivially. Until real tests are added, this service is not actually covered by the "tests must pass" gate in any meaningful sense.
- **No committed coverage threshold.** Coverage is visible, not enforced, from the repo's own config.
- **No CODEOWNERS file** —> merges are gated on CI status, not on required review from a specific owner.
- **Mobile has no E2E tests** —> only 6 unit test files under `src/__tests__/`; user flows on mobile are untested end-to-end.