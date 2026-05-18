This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

# Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

# Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# FlashID Web Portal

The web portal is designed to support multiple role-based experiences, including:

* Citizen Portal
* Officials Portal
* Government Administrator Portal

---

# Tech Stack

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide React icons
* pnpm

---

# Frontend Folder Structure

```txt
src/
├── app/
│   ├── citizens/
│   ├── officials/
│   ├── government-admin/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── assets/
│   ├── images/
│   └── index.ts
│
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   ├── templates/
│   ├── pages/
│   └── ui/
│
├── config/
├── types/
└── lib/
```

---

# Folder Responsibilities

## `src/app/`

Contains Next.js App Router routes, layouts, and pages.

This is where URL routes are created.

Example:

```txt
src/app/citizens/page.tsx
```

creates:

```txt
/citizens
```

Example:

```txt
src/app/government-admin/dashboard/page.tsx
```

creates:

```txt
/government-admin/dashboard
```

The `app/` folder should stay focused on routing and page composition. Avoid putting large reusable components directly inside route files.

---

## `src/assets/`

Stores static project assets such as logos, images, and illustrations.

Example:

```txt
src/assets/images/FlashID-white.png
```

Images should be imported through Next.js where possible:

```tsx
import Image from "next/image";
import FlashIdLogo from "@/assets/images/FlashID-white.png";
```

---

## `src/components/ui/`

Contains shadcn/ui base primitives.

Examples:

```txt
button.tsx
card.tsx
badge.tsx
avatar.tsx
dropdown-menu.tsx
sheet.tsx
```

### Rules

* Do not add business logic here.
* Do not make page-specific components here.
* Treat these as generic reusable UI building blocks.
* Prefer using these before creating custom components.

---

## `src/components/atoms/`

Smallest custom reusable components.

Examples:

```txt
StatusBadge
InitialsAvatar
IconButton
FormLabel
```

Use atoms when a component is small, reusable, and not tied to one page.

---

## `src/components/molecules/`

Small groups of components that work together.

Examples:

```txt
UserProfileChip
CredentialSummaryCard
TrustReadinessBar
SearchInputWithIcon
```

Use molecules when combining multiple atoms or UI primitives into a small reusable pattern.

---

## `src/components/organisms/`

Large reusable interface sections.

Examples:

```txt
AppSidebar
AppTopBar
CredentialList
RecentActivityPanel
```

Use organisms for larger sections that may appear across multiple pages or portals.

---

## `src/components/templates/`

Reusable page-level layouts.

Examples:

```txt
DashboardTemplate
PortalShell
AuthTemplate
```

Templates define structure, not route-specific data.

---

## `src/components/pages/`

Page-specific composed components.

Examples:

```txt
CitizenDashboardPage
GovernmentDashboardPage
OfficialVerificationPage
```

Use this folder when a page becomes too large to keep directly in `src/app/.../page.tsx`.

---

## `src/config/`

Stores static configuration.

Examples:

```txt
navigation.ts
portal.ts
routes.ts
```

Use config for values that control how the app behaves but are not UI components.

Examples:

* sidebar navigation items
* portal titles
* role-based route definitions
* supported credential types

---

## `src/types/`

Stores shared TypeScript types.

Examples:

```txt
navigation.ts
user.ts
credential.ts
portal.ts
```

Use types to define the shape of data.

Example:

```ts
export type SidebarNavItem = {
  label: string;
  href: string;
  icon: string;
};
```

---

## `src/lib/`

Stores shared helper functions.

Example:

```txt
utils.ts
```

This currently includes the `cn()` helper used by shadcn/ui.

---

# Portal Routing

Use route folders for each major portal.

```txt
src/app/
├── citizens/
│   ├── page.tsx
│   ├── credentials/
│   │   └── page.tsx
│   ├── share-qr/
│   │   └── page.tsx
│   └── notifications/
│       └── page.tsx
│
├── officials/
│   ├── page.tsx
│   ├── verify/
│   │   └── page.tsx
│   └── history/
│       └── page.tsx
│
└── government-admin/
    ├── page.tsx
    ├── citizens/
    │   └── page.tsx
    ├── issue-credential/
    │   └── page.tsx
    └── audit-logs/
        └── page.tsx
```

---

# How to Create a New Page

To create a new page, add a folder with a `page.tsx` file inside `src/app`.

Example:

```txt
src/app/citizens/credentials/page.tsx
```

Basic page structure:

```tsx
export default function CitizenCredentialsPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-extrabold text-foreground">
        My Credentials
      </h1>
    </main>
  );
}
```

---

# Page Building Rules

Route files should stay simple.

Good:

```tsx
import { CitizenDashboardPage } from "@/components/pages/citizen-dashboard-page";

export default function Page() {
  return <CitizenDashboardPage />;
}
```

Avoid:

```tsx
export default function Page() {
  return (
    // 500 lines of JSX directly inside the route file
  );
}
```

If a page becomes large, move the page body into:

```txt
src/components/pages/
```

---
# Export Convention

Use named exports for reusable utilities, hooks, types, constants, and components. This keeps imports explicit and easier to refactor.

Use a default export only for Next.js route entry files such as `page.tsx` and `layout.tsx`, because Next.js requires the route component to be exported as the default function.

Example:

```tsx
export const metadata = { title: 'Credentials' };
export const revalidate = 60;

export const formatCredential = (raw) => {
  return raw;
};

export function CredentialCard({ data }) {
  return <div>{data.name}</div>;
}

export default function CitizenCredentialsPage() {
  return <CredentialCard data={{ name: 'ID Document' }} />;
}
```


>Tiny note: I would **not** usually put hooks/components/utilities inside `page.tsx` long-term. Better pattern:

```text
credentials/
  page.tsx
  components/
    credential-card.tsx
  hooks/
    use-credentials.ts
  utils/
    format-credential.ts
---

# Layout Rules

The global shell lives in:

```txt
src/app/layout.tsx
```

It should contain shared app structure such as:

* sidebar
* top bar
* main content area
* global fonts
* global theme styling

Example layout structure:

```tsx
<div className="flex h-screen overflow-hidden bg-background">
  <AppSidebar navSections={...} user={...} />

  <div className="flex-1 overflow-y-auto">
    <AppTopBar title={...} description={...} user={...} />
    {children}
  </div>
</div>
```

---

# Styling Rules

FlashID uses Tailwind CSS with semantic design tokens.

Prefer semantic classes:

```tsx
bg-background
text-foreground
bg-card
text-card-foreground
text-muted-foreground
border-border
bg-primary
text-primary-foreground
```

Avoid hardcoded one-off colours:

```tsx
bg-[#007A4D]
text-[#111827]
border-[#E5E7EB]
```

Brand-specific colours may be used only when intentional:

```tsx
bg-deep-green
text-clean-white
bg-accent-gold
text-primary-green
```

---

# Using shadcn/ui Components

Import components directly from the `@/components/ui` directory.

Example:

```tsx
import { Button } from "@/components/ui/button";

export default function ExamplePage() {
  return <Button>Click Me</Button>;
}
```

Multiple exports from a component can be imported together:

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
```
---

# Component Creation Rules

Before creating a new component, check:

1. Does shadcn/ui already provide this?
2. Does `components/ui/` already have a primitive for this?
3. Does an atom, molecule, organism, or template already exist?
4. Can this be composed from existing components?

Only create a new component if it is genuinely reusable or needed for page clarity.

---

# Adding shadcn/ui Components

FlashID uses shadcn/ui as the base UI component system.

To add a new shadcn component, run the command from inside the `web/` folder:

````md
```bash
pnpm dlx shadcn@latest add component-name

````
---

# Navigation Rules

Sidebar navigation should be configuration-driven.

Do not hardcode portal navigation directly inside the sidebar component.

Navigation config should live in:

```txt
src/config/navigation.ts
```

The sidebar should receive navigation data as props.

This allows the same sidebar component to support:

* Citizen Portal
* Official Portal
* Government Administrator Portal

---

# Mock Data Rules

Mock data is allowed during early implementation and Demo 1 preparation.

Mock data should be clearly marked:

```ts
// TODO: Replace with authenticated session data once login is implemented.
const mockUser = {
  name: "Unathi Tshakalisa",
  initials: "UT",
  idLabel: "ID: •••••••084",
};
```

Do not spread mock data randomly across many components. Keep it near the layout or page using it.

---

# Naming Conventions

## Files

Use kebab-case for files:

```txt
app-sidebar.tsx
app-top-bar.tsx
citizen-dashboard-page.tsx
```

---

## Components

Use PascalCase for component names:

```tsx
export function AppSidebar() {}
export function AppTopBar() {}
```

---

## Routes

Use lowercase kebab-case for route folders:

```txt
government-admin
share-qr
audit-logs
```

---

# Icon Usage

FlashID uses Lucide React icons.

Import icons from:

```tsx
import { Bell, LayoutDashboard } from "lucide-react";
```

Do not mix icon libraries unless the team agrees to update the design system.

---

# Pull Request Expectations

Before opening a PR:

```bash
pnpm --filter web build
```

Also check:

```bash
git status
```

PRs should include:

* what changed
* why it changed
* screenshots for UI changes
* notes about mock data or future TODOs
* confirmation that the build passes

---

# Current Frontend Direction

The current frontend foundation includes:

* shadcn/ui setup
* FlashID design tokens
* Inter typography
* reusable sidebar
* reusable top bar
* route-ready portal structure
* mock user/session placeholders
* dark mode token support

Future work will connect the layout to authentication, session management, and role-based portal selection.

