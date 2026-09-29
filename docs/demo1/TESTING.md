# FlashID Testing Guide
**Tech Titans · COS 301 Capstone 2026**

---

## Overview

FlashID uses two separate testing stacks:

- **Backend** — xUnit (C#) for unit and integration tests
- **Frontend** — Jest + React Testing Library (TypeScript) for unit and component tests
- **E2E** — Cypress or Playwright (planned after Demo 1)

---

## Test Types Defined

### Unit Test
Tests a single function, class, or component in complete isolation. All external dependencies (database, API, other services) are mocked. Runs fast with no network or DB access.

### Component Test
Tests a React component in isolation using a fake browser environment (jsdom). Does not make real HTTP calls. The component may use React Query hooks but mutations/queries never actually fire against a real backend. This is what `register-institution-form.test.tsx` is — a component test, not an integration test.

### Integration Test
Tests multiple real layers working together. For the backend this means hitting a real database. For the frontend this means a real running backend receives the HTTP request. No mocking of the actual system under test.

### E2E Test
Tests the full application in a real browser with a real backend and database. Simulates a real user clicking through flows.

---

## Backend Unit Tests

### Stack
- Framework: xUnit v3
- Project: `backend/FlashIdBackend/tests/`
- Run command:
```bash
cd backend/FlashIdBackend/tests
dotnet test
```

### Folder Structure
backend/FlashIdBackend/tests/
├── tests.csproj
├── xunit.runner.json
├── CitizenRegistrationValidatorTests.cs
└── InstitutionValidatorTests.cs

### What to Test
- **Validators** — every validation rule (empty, too long, invalid format, valid input)
- **Services** — business logic with mocked DbContext
- **Controllers** — HTTP responses for success and error cases

### Naming Convention
{ClassName}Tests.cs

### Test Pattern
One `ValidRequest()` helper, one `[Fact]` per rule:

```csharp
public class InstitutionValidatorTests
{
    private static RegisterInstitutionRequestDto ValidRequest() => new()
    {
        Name = "Home Affairs JHB",
        VerificationNumber = "HA-JHB-001",
        AdminId = Guid.NewGuid(),
    };

    [Fact]
    public void Validate_ValidRequest_DoesNotThrow()
    {
        var ex = Record.Exception(() => InstitutionValidator.Validate(ValidRequest()));
        Assert.Null(ex);
    }

    [Fact]
    public void Validate_NameEmpty_ThrowsInvalidRequest()
    {
        var req = ValidRequest();
        req.Name = "";
        Assert.Throws<InvalidInstitutionRequestException>(
            () => InstitutionValidator.Validate(req));
    }
}
```

### Rules
- One test file per class
- One `[Fact]` per rule or scenario
- Always include a "valid request does not throw" test
- Method names follow: `MethodName_Condition_ExpectedResult`
- No real database calls in unit tests — mock all dependencies

---

## Backend Integration Tests

> Setup required — planned after Demo 1.

Backend integration tests will test the full service → database flow using a real SQL Server test database.

### Planned Setup
- Add `Infrastructure` project reference to `tests.csproj`
- Add EF Core + SQL Server packages to test project
- Add a test connection string pointing to a separate `FlashIdTestDb`
- Write tests that seed data, call the service, and assert DB state

### Planned Test Coverage
- `InstitutionService.RegisterInstitutionAsync` — institution created in DB, audit log written
- `InstitutionService.GetAllInstitutionsAsync` — returns all seeded institutions
- `AuthService.LoginAsync` — returns valid JWT for correct credentials, throws for wrong password

### Naming Convention
{ClassName}IntegrationTests.cs

---

## Frontend Unit and Component Tests

### Stack
- Framework: Jest + React Testing Library
- Run command (from `web/` folder):
```bash
cd web
npx jest --coverage
```

### Folder Structure
Tests live in a `test/` folder next to the file being tested:
src/components/organisms/register-institution-form/
├── register-institution-form.tsx
└── test/
└── register-institution-form.test.tsx
src/components/atoms/button/
├── button.tsx
└── test/
└── button.test.tsx
src/services/institution-service/
├── institution-service.ts
└── test/
└── institution-service.test.ts

### What to Test

**Components** — rendering and user interactions:
- Does it render the correct elements?
- Does it respond correctly to user input?
- Does it show the correct state changes?

**Services** — DTOs, models, and URL builders:
- Does the DTO map form values to backend field names correctly?
- Does the model map backend response to frontend shape correctly?
- Are URLs built correctly?

**Config** — navigation and page headers:
- Do all nav items have non-empty hrefs?
- Are required items present in each portal's nav?

### Naming Convention
{filename}.test.tsx   (for React components)
{filename}.test.ts    (for services, config, utils)

### Test Pattern for Components
Render, query, assert:

```tsx
describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Go</Button>)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
```

### Components Using React Query
Any component using `useQuery` or `useMutation` must be wrapped with `QueryClientProvider`:

```tsx
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

render(<MyComponent />, { wrapper: createWrapper() })
```

Note: wrapping with `QueryClientProvider` does NOT make a test an integration test. The mutation/query function never fires against a real backend — this is still a component unit test.

### Rules
- Test files live in `test/` next to the component
- Use `screen.getByRole` over `getByTestId` where possible
- Use `userEvent` for simulating user interactions
- Never make real HTTP calls in unit tests — mock axios or use msw
- Components using `useQuery` or `useMutation` must be wrapped with `QueryClientProvider`

---

## Frontend E2E Tests

> Planned after Demo 1.

E2E tests simulate real user flows in a real browser with a real running backend and database.

### Planned Stack
- Tool: Cypress or Playwright (TBD after Demo 1)

### Planned Flows
- GovernmentAdmin logs in → uploads institution → sees institution in list
- Official logs in → onboards citizen → activation code generated
- Citizen activates wallet → views credentials
- Citizen generates QR code → verifier scans and verifies

### Naming Convention
{flow-name}.cy.ts   (Cypress)
{flow-name}.spec.ts (Playwright)

---

## Coverage

The CI runs coverage on every PR via Codecov.

| Layer | Tool | Target |
|---|---|---|
| Frontend | Jest + Codecov | 95.54% patch coverage |
| Backend | xUnit | No threshold set yet |

Low coverage on new code will be flagged by Codecov on PRs. Add tests for new files in the same PR as the feature or in a dedicated testing PR immediately after.