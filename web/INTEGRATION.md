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

# One-Time Setup

## React Query Provider

React Query needs a `QueryClientProvider` wrapping the app. Because it uses hooks, this must be a client component.

Create `src/app/providers.tsx`:

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

Then wrap the app in `src/app/layout.tsx`:

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

Add the API URL to `.env.local`:

```txt
NEXT_PUBLIC_API_URL=http://localhost:8080
```

The `NEXT_PUBLIC_` prefix is required so the variable is available in the browser.

---

# Services Folder Structure

```txt
src/services/
├── login-service/
│   ├── index.ts
│   ├── login-urls.ts
│   ├── login-service.ts
│   ├── login-dto.ts
│   ├── login-model.ts
│   └── types.ts
│
├── user-service/
│   ├── index.ts
│   ├── user-urls.ts
│   ├── user-service.ts
│   ├── user-dto.ts
│   ├── user-model.ts
│   └── types.ts
│
└── product-service/
    ├── index.ts
    ├── product-urls.ts
    ├── product-service.ts
    ├── product-dto.ts
    ├── product-model.ts
    └── types.ts
```

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
  userId: number
  token: string
}
```

---

## `*-urls.ts`

Stores every endpoint for the feature in one place.

Example:

```ts
const apiUrl = process.env.NEXT_PUBLIC_API_URL

export default {
  login: (): string => `${apiUrl}/auth/login`,
  logout: (): string => `${apiUrl}/auth/logout`,
  getUser: (id: number): string => `${apiUrl}/auth/user/${id}`,
}
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

Contains the actual HTTP calls. This is the only file that uses axios.

Example:

```ts
import axios, { AxiosResponse } from 'axios'

import loginUrls from './login-urls'
import { loginDto } from './login-dto'
import { LoginFormValues } from './types'

const login = (formData: LoginFormValues) => {
  const url = loginUrls.login()
  const dto = loginDto(formData)
  return axios.post(url, dto).then((res: AxiosResponse) => res.data)
}

const getUser = (id: number) => {
  const url = loginUrls.getUser(id)
  return axios.get(url).then((res: AxiosResponse) => res.data)
}

export default {
  login,
  getUser,
}
```

Every function does the same three steps:

1. Get the URL.
2. Run the DTO if sending data.
3. Call axios and return `res.data`.

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
// src/app/login/page.tsx
import { LoginForm } from '@/components/pages/login-form'

export default function LoginPage() {
  return <LoginForm />
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

Axios is the HTTP client. Four methods cover almost everything:

```ts
axios.get(url) // read
axios.post(url, body) // create
axios.put(url, body) // update
axios.delete(url) // delete
```

Every response is wrapped in an object. The real data is at `response.data`. Strip the wrapper at the service layer:

```ts
return axios.post(url, dto).then((res) => res.data)
```

---

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
- Components never import axios.
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
4. Write `*-dto.ts` and `*-model.ts`.
5. Write `*-service.ts`.
6. Export everything from `index.ts`.
7. In the component, add `'use client'` and use `useQuery` to read or `useMutation` to write.

Same pattern every time.
