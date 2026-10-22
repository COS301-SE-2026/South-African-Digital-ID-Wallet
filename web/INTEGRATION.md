# Frontend ↔ Backend Integration Guide

This explains how the Next.js frontend talks to the backend API. Follow this pattern for every new feature so the team's code stays consistent.

The integration layer lives under `src/services/` and is organised by feature. Each feature gets its own folder with five small files.

---

# Tech Stack

- Next.js 16 (App Router)
- React 19
- Axios — HTTP client
- TanStack React Query — data fetching and caching
- React Hot Toast — success and error notifications
- TypeScript

All dependencies are already installed in the project. No setup steps needed beyond the provider files below.

---

# One-Time Setup (already done)

## React Query Provider

React Query needs a `QueryClientProvider` wrapping the app. Because it uses hooks, this must be a client component.

It lives in `src/app/providers.tsx`:

```tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

`src/app/layout.tsx` wraps the app in it:

```tsx
import { Providers } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```txt
API_INTERNAL_URL=http://localhost:5118
JWT_SECRET=<same value as the backend's Jwt:Key>
```

The browser never calls the backend directly. Service URLs are relative (`/api/...`), and `src/app/api/[...path]/route.ts` forwards them to `API_INTERNAL_URL` on the server, so the auth cookies stay on the web app's own origin. `src/proxy.ts` uses `JWT_SECRET` to check the `access_token` cookie before rendering a portal page. Leave `NEXT_PUBLIC_API_URL` unset for normal development.

---

# Services Folder Structure

```txt
src/services/
├── login-service/
│   ├── index.ts
│   ├── login-urls.ts
│   ├── login-service.ts
│   ├── login-dto.ts
│   ├── types.ts
│   └── test/
│
├── credential-service/
├── qr-service/
├── manage-user-account-service/
└── ...                      one folder per backend feature
```

`*-model.ts` is only added when the backend shape needs translating, so most services do not have one.

---

# The Idea

The shape the backend sends is usually different from the shape the form wants. So we put a small translation layer in the middle.

Component -> Service -> Backend
Component <- Service <- Backend

- The component only knows about form values.
- The service translates and makes the HTTP call.
- The backend can call its fields whatever it wants.

---

# File Responsibilities

## `types.ts`

Defines the shapes used by the feature.

Examples:

```txt
LoginFormValues
LoginResponse
UserListResponse
```

Use this file to describe what the form looks like and what the backend returns.

Example:

```ts
export type LoginFormValues = {
  email: string
  password: string
}

export type LoginResponse = {
  userId: string
  role: string
  token: string
  expiresAt: string
  refreshTokenExpiresAt?: string | null
  requiresDeviceVerification: boolean
  deviceVerificationId?: string | null
}
```

---

## `*-urls.ts`

Stores every endpoint for the feature in one place.

Example:

```ts
const loginUrls = {
  login: (): string => '/api/auth/login',
  verifyDevice: (): string => '/api/auth/verify-device',
  forgotPassword: (): string => '/api/auth/forgot-password',
}

export default loginUrls
```

### Rules

- Do not hardcode URLs anywhere else in the codebase.
- Use functions, not constants, so URLs can accept arguments like `id` or `page`.

---

## `*-dto.ts`

Translates form values into the shape the backend expects.

Use this when sending data to the backend. The DTO is the only file that knows about backend field names.

Example:

```ts
import { LoginFormValues } from './types'

export const loginDto = (formData: LoginFormValues) => {
  return {
    user_email: formData.email,
    user_password: formData.password,
    login_attempt_at: new Date().toISOString(),
  }
}
```

The form says `email`, the backend wants `user_email`. The DTO handles that.

---

## `*-model.ts`

Translates backend data into the shape the form expects.

Use this when receiving data from the backend. This is the opposite of the DTO.

Example:

```ts
import { LoginFormValues } from './types'

export type LoginBackendRow = {
  user_email: string
  user_password: string
}

export const loginFormModel = (row: LoginBackendRow): LoginFormValues => {
  return {
    email: row.user_email,
    password: row.user_password,
  }
}
```

---

## `*-service.ts`

Contains the actual HTTP calls. This is the only file that makes requests, always through the shared `api` instance from `@/lib/api`.

Example:

```ts
import api from '@/lib/api'
import loginUrls from './login-urls'
import { loginDto } from './login-dto'
import type { LoginFormValues, LoginResponse } from './types'

const login = (formData: LoginFormValues): Promise<LoginResponse> => {
  const url = loginUrls.login()
  const dto = loginDto(formData)
  return api.post(url, dto).then((res) => res.data as LoginResponse)
}

const loginService = {
  login,
}

export default loginService
```

Every function does the same three steps:

1. Get the URL.
2. Run the DTO if sending data.
3. Call `api` and return `res.data`.

---

## `index.ts`

Exports everything that components are allowed to import.

Example:

```ts
export * from './login-urls'
export { default as loginService } from './login-service'
export * from './types'
export * from './login-model'
```

Components should only import from this file.

---

# How to Create a New Service

To create a new service, add a folder under `src/services/`.

Example:

```txt
src/services/product-service/
```

Steps:

1. Create `types.ts` first.
2. Create `product-urls.ts`.
3. Create `product-dto.ts` and `product-model.ts`. -> (NB!!! This is optional, you can force through it by calling the data names the same as backend)
4. Create `product-service.ts`.
5. Create `index.ts` to export everything.

---

# Using the Service in a Component

Components that use `useQuery` or `useMutation` must be **client components** because React Query relies on hooks.

Add `'use client'` at the top of the file.

Example:

```tsx
'use client'

import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { loginService, LoginFormValues } from '@/services/login-service'

export function LoginForm() {
  const { mutate: doLogin, isPending } = useMutation({
    mutationFn: (formValues: LoginFormValues) => loginService.login(formValues),
    onSuccess: () => {
      toast.success('Logged in')
    },
    onError: () => {
      toast.error('Login failed')
    },
  })

  const handleSubmit = (formValues: LoginFormValues) => {
    doLogin(formValues)
  }

  return (
    // ...form here
  )
}
```

Then import the client component into a route page:

```tsx
// src/app/(auth)/login/page.tsx
import { LoginPage } from '@/components/pages/login/login-page'

export default function Page() {
  return <LoginPage />
}
```

### Rules

- Any component using `useQuery` or `useMutation` needs `'use client'`.
- Keep route files (`page.tsx`) as server components when possible.
- Move client-side logic into a client component under `src/components/pages/`.

---

# `useQuery` — Reading Data

Use `useQuery` when the component needs to **read** data and show it.

Example:

```tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { userService } from '@/services/user-service'

export function UserList({
  page,
  pageSize,
}: {
  page: number
  pageSize: number
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['userList', page, pageSize],
    queryFn: () => userService.getUserList(page, pageSize),
  })

  if (isLoading) return <p>Loading...</p>

  return <div>{/* render data */}</div>
}
```

## What the parts mean

- **`queryKey`** — an array that uniquely identifies the query. Include every value that affects the result.
- **`queryFn`** — a function that returns a Promise. Just call your service.

When any value in the `queryKey` changes, React Query refetches automatically.

## What you get back

```txt
data        // the data once it loads
isLoading   // true while fetching for the first time
error       // the error if the request failed
refetch()   // manually fetch again
```

## Example with filters

```ts
const { data, isLoading } = useQuery({
  queryKey: ['productList', page, pageSize, filters],
  queryFn: () =>
    productService.getProductList(page, pageSize, {
      searchText: filters.searchText || undefined,
      categoryId: filters.categoryId ? Number(filters.categoryId) : undefined,
    }),
})
```

The `|| undefined` pattern sends `undefined` instead of an empty string when a filter is empty.

---

# `useMutation` — Writing Data

Use `useMutation` when the component needs to **change** data — create, update, or delete.

Unlike `useQuery`, it does not run automatically. You call `mutate()` when you want it to fire.

Example:

```ts
import toast from 'react-hot-toast'

const { mutate, isPending } = useMutation({
  mutationFn: (formValues: LoginFormValues) => loginService.login(formValues),
  onSuccess: () => {
    toast.success('Logged in')
  },
  onError: () => {
    toast.error('Login failed')
  },
})

// later:
mutate(formValues)
```

## What the parts mean

- **`mutationFn`** — the function that does the work.
- **`onSuccess`** — runs after the request succeeds.
- **`onError`** — runs if the request fails.
- **`isPending`** — `true` while the request is running. Use this to disable submit buttons.

## Refetching lists after a write

When you create or update something, the cached list is out of date. Tell React Query to refetch it:

```ts
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

const queryClient = useQueryClient()

const { mutate } = useMutation({
  mutationFn: (formValues) => productService.createProduct(formValues),
  onSuccess: () => {
    toast.success('Product created')
    queryClient.invalidateQueries({ queryKey: ['productList'] })
  },
})
```

`invalidateQueries` marks the data as stale and refetches it automatically.

---

# Axios Basics

Axios is the HTTP client, used through the shared instance in `src/lib/api.ts`. Four methods cover almost everything:

```ts
api.get(url) // read
api.post(url, body) // create
api.put(url, body) // update
api.delete(url) // delete
```

Every response is wrapped in an object. The real data is at `response.data`. Strip the wrapper at the service layer:

```ts
return api.post(url, dto).then((res) => res.data)
```

---

## Authentication

The web app never handles the JWT itself. On login the backend sets three cookies on the web app's origin:

- `access_token` - HttpOnly JWT, valid for 15 minutes (`Jwt:AccessTokenMinutes`)
- `refresh_token` - HttpOnly, valid for 8 hours, or 30 days with "remember me", and renewed on every refresh
- `csrf_token` - readable by JavaScript

`src/lib/api.ts` handles the rest, so services need no auth code:

- sends cookies with every request (`withCredentials: true`)
- copies `csrf_token` into the `X-CSRF-Token` header on POST, PUT, PATCH and DELETE
- on a 401, calls `POST /api/auth/refresh` once and retries the request; if the refresh also fails it clears local user data and returns to `/`

`src/proxy.ts` does the same refresh on page navigation when the access token has expired. See [csrf-protection.md](../docs/demo4/security/csrf-protection.md).

# React Query Devtools

The devtools are already installed and mounted in the `Providers` component. A small floating icon appears at the bottom of the screen in development.

Use it to:

- See which queries are active.
- Inspect cached data.
- Manually trigger refetches.
- Debug why a query is or is not refetching.

---

# Naming Conventions

## Folders

Use kebab-case for service folders:

```txt
login-service
user-service
product-service
```

## Files

Use kebab-case for files inside each service:

```txt
login-urls.ts
login-service.ts
login-dto.ts
login-model.ts
```

## Functions

Use camelCase for service functions:

```ts
login()
getUser()
createProduct()
getProductList()
```

## Query Keys

Use camelCase strings and include every value that affects the result:

```ts
;['userList', page, pageSize][('productList', page, pageSize, filters)][
  ('userById', id)
]
```

---

# Service Creation Rules

Before creating a new service, check:

1. Does a service for this feature already exist?
2. Can the new endpoint fit inside an existing service?
3. Is this its own feature, or part of a larger one?

Only create a new service folder if the feature is genuinely separate.

---

# Rules of Thumb

- One feature = one folder = five files.
- Components never import axios or `@/lib/api`.
- Components never see snake_case fields. That is the DTO and model's job.
- Query keys must include everything that affects the result.
- Always return `res.data` from service functions.
- Use `useQuery` for reads, `useMutation` for writes.
- After a successful mutation, invalidate the related queries.
- Any component using `useQuery` or `useMutation` needs `'use client'`.

---

# Checklist for a New Feature

1. Create the folder: `src/services/<feature>-service/`
2. Write `types.ts` first.
3. Write `*-urls.ts`.
4. Write `*-dto.ts` and `*-model.ts` if the backend shape needs translating.
5. Write `*-service.ts`.
6. Export everything from `index.ts`.
7. In the component, add `'use client'` and use `useQuery` to read or `useMutation` to write.

Same pattern every time.
