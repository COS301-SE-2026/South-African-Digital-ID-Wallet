# Frontend Engineering Guide

A working style guide for FlashID's Next.js + TypeScript web app (`web/`).

Every rule in here is illustrated with a real pattern from this codebase, so you can see
*why* the rule exists rather than just being told to follow it. Read the "Quick rules"
box at the top of each section if you're in a hurry; read the examples when you're about
to write the code.

This guide mostly describes the app **as it actually is today**, not an aspirational
ideal. Where the codebase is inconsistent, that's called out explicitly rather than
papered over.

---

## 1. Import standards

**Import alias:** `@/*` maps to `src/*`.

```ts
// Correct
import { Text } from '@/components/atoms'

// Wrong
import { Text } from '../../../components/atoms'
```

Relative imports are only acceptable **within the same component folder**:

```ts
import { Dropdown } from './dropdown'
import type { DropdownProps } from './types'
```

---

## 2. Where things live

```
web/src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Route group: login / register / verify-email
│   ├── (portal)/         # Route group: citizen / officials / gov-admin dashboards
│   └── globals.css       # Tailwind v4 tokens (@theme inline block)
├── components/
│   ├── atoms/            # button, text, status-pill, status-item, activity-item, …
│   ├── molecules/        # dropdown, text-field, account-card, credentials-list, …
│   ├── organisms/        # login-form, registration-form, field-selection-form, …
│   ├── templates/        # app-shell, otp-modal
│   ├── pages/            # route-level compositions (see §17)
│   ├── ui/                # shadcn/Radix primitives
│   └── utility/          # cross-cutting, non-visual components
├── context/              # React Context providers
├── lib/                  # api.ts (axios instance), utils.ts (cn helper)
├── schemas/              # Zod schemas, shared app-wide
├── services/             # All network access lives here
├── types/                # Shared TypeScript types
└── config/               # Route permissions, navigation config
```

**The rule that matters most:** a file's location tells you what it's allowed to do.

- `app/` may only compose components and fetch data. If you find yourself writing
  layout JSX in `app/`, it belongs in `components/pages/` or below.
- `components/` may not call `axios` directly. It calls a **service**.
- `services/` is the only place that knows about URLs, HTTP verbs and API shapes.

---

## 3. Naming | files, folders, exports

### Quick rules

| Thing | Convention | Example |
|---|---|---|
| Folder | `kebab-case`, singular concept | `credential-detail-card/` |
| Component file | `kebab-case.tsx`, matches folder | `credential-detail-card.tsx` |
| Types file | `types.ts` | `types.ts` |
| Barrel | `index.ts` | `index.ts` |
| Component export | `PascalCase`, **named export** | `export const CredentialDetailCard` |
| Type / interface | `PascalCase`, props suffixed `Props` | `CredentialCardProps`, `AppSidebarProps` |
| Hook | `useThing` | `useUser` |
| Zod schema | `<thing>Schema` | `onboardingSchema` |
| Constant | `SCREAMING_SNAKE_CASE` | `DASHBOARD_ROUTES`, `USER_STORAGE_KEY` |

### Props type suffix —> `Props`, not `PropsType`

The overwhelming majority of `types.ts` files in this codebase name their props type
`<ComponentName>Props` —> e.g. `CredentialCardProps`, `AppSidebarProps`,
`StatusPillProps`, `ActivityItemProps`. **`Button` is the one legacy exception**
(`ButtonPropsType`). Use `Props`, not `PropsType`, for anything new please don't propagate
the `Button` outlier.

### Folder-per-component

Every component gets its **own folder**, even if it's one file. This keeps its types
and any sub-parts together and means you can move it between atom/molecule/organism
without touching import paths.

```
components/atoms/button/
├── button.tsx      # the component
├── types.ts        # its props
├── index.ts        # barrel
└── test/
    └── button.test.tsx
```

The `test/<component-name>.test.tsx` subfolder is not a colocated `button.test.tsx`
next to the component, not a top-level `__tests__/`, this is how every existing component
does it. `jest.config.ts`'s `testMatch` is built around this (`**/test/**/*.[jt]s?(x)`),
so putting a test file anywhere else means it won't run.

### Barrels (`index.ts`)

Each component folder has a barrel that re-exports the component and its types, and
each layer has a barrel that re-exports its components:

```ts
// components/atoms/button/index.ts
export * from './button'
export * from './types'
```

```ts
// components/atoms/index.ts
export * from './button'
export * from './text'
// …
```

So consumers import from the layer, not the file:

```ts
// Correct
import { Button, Text } from '@/components/atoms'

// Incorrect
import { Button } from '@/components/atoms/button/button'
```

**When you add a component you must add it to its layer's barrel.** A component not in
the barrel is invisible to the rest of the team and will get rebuilt by someone else.

> The `atoms/index.ts` barrel currently has a couple of redundant duplicate export
> lines (the same component re-exported via two different paths).
> pattern when adding a new one; add exactly one `export * from './your-component'`.

---

## 4. Decision rule

Write a **server component** (no directive) unless you need one of:

- `useState`, `useEffect`, `useRef`, or any hook
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`window`, `localStorage`)
- A client-only library (TanStack Query, Radix, `react-hook-form`)

If you need any of those, add `'use client'` as the first line of the file:

```tsx
'use client'

import * as React from 'react'
```

In practice most interactive pieces of this app (forms, the sidebar, the dashboard
pages) are client components.

**Do not add `'use client'` to a component just to silence an error**, work out which
child actually needs it and push the boundary down to that child where practical.

---

## 5. How to write a component

### The template

```tsx
// components/molecules/credential-card/credential-card.tsx
'use client'

import { cn } from '@/lib/utils'
import { Text } from '@/components/atoms'

import type { CredentialCardProps } from './types'

export const CredentialCard = ({
  activated,
  available,
  className,
  description,
  icon: Icon,
  onToggle,
  title,
}: CredentialCardProps) => (
  <div className={cn('flex flex-col gap-2 rounded-md border p-4', className)}>
    <Icon className="h-5 w-5 text-deep-green" />
    <Text variant="h4">{title}</Text>
    <Text variant="sub-sm">{description}</Text>
  </div>
)
```

```ts
// components/molecules/credential-card/types.ts
import { LucideIcon } from 'lucide-react'

export type CredentialCardProps = {
  icon: LucideIcon
  title: string
  description: string
  available: boolean
  activated: boolean
  onToggle: (activated: boolean) => void
  className?: string
}
```

### The rules

1. **Named exports only** for anything in `components/atoms|molecules|organisms|templates`.
   No `export default`. *(Exceptions: `app/**/page.tsx` / `layout.tsx`, Next.js
   requires it and, as it stands today, several files in `components/pages/`, which
   use `export default function Thing()` instead of a named export. That's an existing
   inconsistency in the `pages/` layer specifically; don't spread it into
   atoms/molecules/organisms/templates.)*

2. **Props live in `types.ts`**, never inline in the component file, named
   `<ComponentName>Props` (see [§3](#3-naming--files-folders-exports)).

3. **Destructure props in the signature.** Typing the whole component as `FC<Props>`
   shows up in a handful of places (mostly atoms) but plain.

4. **Sort props alphabetically** in the type, in the destructure, and when passing
   them in JSX where practical. It removes a category of merge conflict.

5. **Accept `className` on anything visual** and merge it last via `cn`. See [§9](#9-styling-rules).

6. **`dataCy` is opt-in, not universal.** It exists on `Button` and `Text` today and
   is rarely actually passed. Playwright specs mostly select by `getByRole`/`getByText`
   instead (see [§18](#18-testing)) please don't treat "every interactive component needs
   `dataCy`" as a hard rule the way you might in a Cypress-based project.

7. **Extend native props** rather than re-declaring them:

   ```ts
   export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
     label?: string
     error?: string
   }
   ```

8. **Icons are passed as components**, typed with `LucideIcon` from `lucide-react`
   (this project's icon set), using capitalised prop names so the consumer can style
   them:

   ```tsx
   <Button RightIcon={ArrowRightIcon} variant="primary">Continue</Button>
   ```

9. **Constants go above the component**, in `SCREAMING_SNAKE_CASE`:

   ```tsx
   const DASHBOARD_ROUTES: Record<string, string> = {
     citizen: '/citizen/citizen-dashboard',
     official: '/officials',
   }
   ```

10. **Small sub-components can live in the same file** if they're only used there for to
    give them their own file in the folder once they need their own props type.

11. **No `console.log`** left in committed code.

---

## 6. Typography please always use `<Text />`

### Quick rule

> **Never write `<h1>`, `<h2>`, `<p>`, `<span>` with your own font classes.
> Always use `<Text variant="…" />`.**

```tsx
// Correct
<Text variant="h2">Your Credentials</Text>
<Text variant="sub-md">Everything you've verified so far.</Text>

// Incorrect
<h2 className="text-2xl font-bold text-deep-green">Your Credentials</h2>
```

### Why

`Text` is the single source of truth for typography. Every font weight, size, colour
and responsive breakpoint for text is defined in **one file**:

```tsx
// components/atoms/text/text.tsx
const TEXT_VARIANT_CLASSNAMES: Record<TextProps['variant'], string> = {
  h1: 'font-bold tracking-tight text-deep-green text-3xl md:text-4xl',
  h2: 'font-bold tracking-tight text-deep-green text-2xl md:text-3xl',
  h3: 'font-bold tracking-tight text-deep-green text-xl md:text-2xl',
  h4: 'font-bold tracking-tight text-deep-green text-lg md:text-xl',
  'sub-sm': 'leading-relaxed text-muted-text text-sm md:text-base',
  'sub-md': 'leading-relaxed text-muted-text text-base md:text-lg',
  'sub-lg': 'leading-relaxed text-muted-text text-lg md:text-xl',
  label: 'block font-bold text-primary-green text-lg md:text-xl',
  caption: 'text-xs font-medium tracking-wide text-muted-text',
}

export const Text: FC<TextProps> = ({ children, as = 'p', variant, className, dataCy, ...rest }) => {
  const Component = as
  return (
    <Component data-cy={dataCy} className={cn(TEXT_BASE_CLASSNAME, TEXT_VARIANT_CLASSNAMES[variant], className)} {...rest}>
      {children}
    </Component>
  )
}
```

A design change is a one-line change, responsive sizing is free, and it's impossible
to accidentally ship text in the wrong weight or colour because you never type a font
class.

### The variants

| Variant | Typical use |
|---|---|
| `h1`–`h4` | Headings, largest to smallest —> bold, `text-deep-green` |
| `sub-sm` / `sub-md` / `sub-lg` | Body copy at three sizes —> `text-muted-text` |
| `label` | Field/section labels —> bold, `text-primary-green` |
| `caption` | Small print, timestamps, helper text |

### `variant` vs `as` | semantics vs looks

`variant` controls **appearance**. `as` controls the **rendered HTML element**, and is
a discriminated union tied to which extra props are required:

```tsx
export type TextProps = BaseTextProps &
  (
    | { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' }
    | { as: 'a'; href: string }
    | { as: 'label'; htmlFor?: string }
  )
```

That means `as="a"` forces you to pass `href`, and `as="label"` lets you pass
`htmlFor` through TypeScript which enforces the pairing, so you can't render an anchor-looking
`Text` that silently has no `href`.

```tsx
// Looks like a label, renders as a <label> tied to an input
<Text as="label" htmlFor="email" variant="label">Email address</Text>
```

### Overriding

Pass `className` for one-off tweaks: colour, alignment, spacing. `cn` makes the
override win over the variant. **Don't override font size or weight this way**. If
you need a size that doesn't exist, that's a new variant, not a `className` hack.

---

## 7. Buttons and other variant components

Same principle as `Text`: **never style a raw `<button>`.** Use `<Button />`.

```tsx
<Button
  disabled={isSubmitting}
  isLoading={isSubmitting}
  onClick={handleSubmit}
  RightIcon={ArrowRight}
  type="submit"
  variant="primary"
>
  Continue
</Button>
```

| Variant | Look |
|---|---|
| `primary` | Solid deep-green fill, white text |
| `secondary` | Outlined deep-green, fills solid on hover |
| `text` | Plain text button, no border/fill |
| `custom` | No styling applied, for one-off/icon-only buttons |

`Button` handles for you:

- variant styles for the button **and** for its icon/text colour
- disabled state per variant
- the loading spinner (`isLoading` → a `lucide-react` `Loader2` spin, and the label is
  hidden while loading)
- wrapping the label in a styled `<span>` so button text sizing is consistent

### The variant pattern, generalised

When you build any component with visual variants, follow the same shape used by
`Button` and `Text`:

```tsx
const VARIANT_CLASSNAMES: Record<Variant, string> = {
  primary: '…',
  secondary: '…',
}

className={cn(BASE_STYLE, VARIANT_CLASSNAMES[variant], className)}
```

`Record<Variant, string>` is the important bit: TypeScript errors if you add a variant
to the union and forget to style it.

**Related components that already exist like check `components/ui/` and `atoms/`/`molecules/`
before you build a new one:** `Dropdown`, `TextField`, `StatusPill`, plus the shadcn/Radix
primitives in `ui/` (`Card`, `Dialog`, `DropdownMenu`, `Sheet`, `Tabs`, `Tooltip`, …).

---

## 8. Styling rules

### Use `cn`, always

We export our own wrapper that combines `clsx` (conditionals) and `tailwind-merge`
(conflict resolution):

```ts
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```tsx
import { cn } from '@/lib/utils'

className={cn(
  'flex flex-1 items-center gap-2 px-2', // base
  { 'text-danger-red': hasError },        // conditional
  className,                              // caller override, ALWAYS LAST
)}
```

- **Base classes first, caller `className` last** this is `cn` resolves conflicts last-wins.
- **Conditionals go in an object**, not string concatenation.
- **Import from `@/lib/utils`**, not `tailwind-merge`/`clsx` directly.

> One existing file (`components/molecules/dropdown/dropdown.tsx`) imports `twMerge`
> straight from `tailwind-merge` instead of using `cn`. That's a pre-existing
> inconsistency, not the pattern to copy, use `cn` in new code.

### Design tokens live in `globals.css`, not `tailwind.config.js`

Tailwind v4 uses CSS-first config —> **there is no `tailwind.config.js` file**. Brand
colours are defined as CSS custom properties in `src/app/globals.css` and then mapped
into Tailwind via `@theme inline`:

```css
/* src/app/globals.css */
:root {
  --primary-green: #007a4d;
  --deep-green: #053b2c;
  --accent-gold: #ffb81c;
  --national-red: #de3831;
  --national-blue: #002395;
  --clean-white: #ffffff;
  --cream-background: #f7f4ea;
  --muted-text: #6b7280;
  --danger-red: #dc2626;
  /* … */
}

@theme inline {
  --color-primary-green: var(--primary-green);
  --color-deep-green: var(--deep-green);
  --color-accent-gold: var(--accent-gold);
  /* … */
}
```

That's what makes classes like `bg-deep-green`, `text-primary-green`,
`text-danger-red` available as Tailwind utilities.

```tsx
// Correct
<div className="bg-deep-green text-clean-white" />

// Wrong
<div className="bg-[#053b2c] text-white" />
```

If a colour you need isn't defined, **add it as a CSS variable in `globals.css`** (both
the raw `--token` and its `--color-token` mapping in `@theme inline`) with a proper
name. Don't inline the hex.

There's also a full **shadcn semantic token set** (`--background`, `--foreground`,
`--card`, `--primary`, `--muted`, `--destructive`, `--sidebar`, …) with light/dark
values, used by the `components/ui/` primitives prefer the brand tokens
(`deep-green`, `primary-green`, …) in hand-written atoms/molecules, and the semantic
tokens when you're extending a shadcn component that already speaks in them.

### Arbitrary values

`text-[35px]`, `w-[350px]` etc. are acceptable when matching an exact design spec. But:

- **Typography arbitrary values belong in `Text`, not in your component.**
- Prefer the spacing scale (`p-4`, `gap-6`) over `p-[16px]` when they're equivalent.

### Mobile first

Write the mobile style unprefixed, then layer breakpoints:

```tsx
className="flex flex-col gap-4 md:flex-row md:gap-6"
```

---

## 9. Making components reusable

### The test: could another feature use this without editing it?

A component is reusable when it depends only on its props.

**Reusable**

```tsx
type CredentialCardProps = {
  icon: LucideIcon
  title: string
  description: string
  available: boolean
  activated: boolean
  onToggle: (activated: boolean) => void
}
```

**Not reusable**

```tsx
type CredentialCardProps = {
  credential: Credential           // couples the card to one API shape
  showActivateButton: boolean      // a flag that only exists for one screen
}
```

The second version means the card breaks when the credential API response changes, and
grows a new boolean every time someone reuses it.

### Practical rules

1. **Take primitives and children, not domain objects**. In atoms and molecules.
   Organisms are allowed to take domain objects; that's their job.

2. **Lift the mapping to the caller.** Instead of the card knowing about the raw API
   response, the organism/page maps the service response → card props.

3. **Prefer composition over boolean flags.** If you're about to add a third boolean,
   accept `children` or a component prop instead.

4. **Always accept `className`.** Layout is the caller's business, margins especially.

5. **Never hardcode copy** that another instance would want to change.

6. **Extract on the second use, not the first.** When you copy-paste a block for the
   second time, that's your signal to promote it up a layer.

### Promoting a component

Copied a molecule between two organisms? Move it into `molecules/` and import it from
both, and update both barrels. Because every component lives in its own folder,
that's a move plus one import change.

---

## 10. Forms

> **Target pattern, adopted going forward.** Existing forms (`LoginForm`,
> `RegistrationForm`, the onboarding pages) predate this and are still built with
> `useState` per field + a manual submit handler + `zod.safeParse()`. That's not what
> new forms should do, build new forms the way this section describes, and migrate
> an existing form to it when you're already touching it for another reason rather
> than as a drive-by rewrite.

### The architecture

We don't use `<Formik>` or `<form>` directly in a feature. There's one `Form` atom
(`components/atoms/form/`, new build it once and reuse it everywhere) that wires
Formik + Zod + submission + API error handling together:

```tsx
// components/atoms/form/form.tsx
import { Formik, FormikErrors, FormikHelpers } from 'formik'
import { toFormikValidationSchema } from 'zod-formik-adapter'

export const Form = <T extends Record<string, unknown>>({
  initialValues,
  onSubmitForm,
  onSuccess,
  onFailure,
  validationSchema,
  render,
  className,
  ...rest
}: FormProps<T>) => {
  const _handleFormSubmitError = (error: unknown, actions: FormikHelpers<T>) => {
    const apiErrors = (error as { errors?: FormikErrors<T> })?.errors
    if (apiErrors) actions.setErrors(apiErrors)
  }

  const _handleSubmission = (formData: T, actions: FormikHelpers<T>) => {
    onSubmitForm(formData, actions)
      .then(() => {
        if (onSuccess) onSuccess(actions)
      })
      .catch((error) => {
        if (onFailure) onFailure(error, actions)
        else _handleFormSubmitError(error, actions)
      })
      .finally(() => actions.setSubmitting(false))
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(validationSchema)}
      onSubmit={_handleSubmission}
      enableReinitialize
      validateOnBlur
      validateOnChange={false}
      {...rest}
    >
      {render}
    </Formik>
  )
}
```

What you get for free:

- **The Zod schema goes straight into `validationSchema`** -> `zod-formik-adapter`'s
  `toFormikValidationSchema` converts it to a Formik validator, so the same schema
  that powers `z.infer` also drives field-level validation. No separate Formik
  validation function to keep in sync.
- `isSubmitting` reset in `finally`, no stuck spinners.
- **Server-side field errors mapped onto the right fields.** If the API returns
  `{ errors: { email: 'Already taken' } }`, that message appears under the email
  input automatically. This is the biggest reason to go through `Form` instead of
  bare Formik.

### Building a form: the five steps

**1. Write the schema** in `src/schemas/` for now (see [§12](#12-schemas-zod)):

```ts
export const contactDetailsSchema = z.object({
  phone: z.string().trim().regex(/^(?:\+27[678]\d{8}|0[678]\d{8})$/, {
    error: 'Enter a valid South African mobile number.',
  }),
  email: z.string().trim().email({ error: 'Enter a valid email address.' }),
})
```

**2. Derive the type**, never hand-write it:

```ts
export type ContactDetailsFormData = z.infer<typeof contactDetailsSchema>
```

**3. Define initial values** as a module-level constant, typed by that type:

```tsx
const INITIAL_VALUES: ContactDetailsFormData = { phone: '', email: '' }
```

TypeScript now errors if the schema and initial values drift apart.

**4. Write the fields** as a separate `FormComponent`. Existing molecules like
`TextField` are plain controlled inputs (`value`/`onChange`/`error` as props), so
either build a thin Formik-aware wrapper that reads/writes via `useField(name)` and
passes the result down to `TextField`, or use `Dropdown`'s existing
`useFormContext: true` mode as the model for a field that's Formik-context-aware
directly:

```tsx
const FormComponent: FC = () => {
  const { getFieldMeta, setFieldValue } = useFormikContext<ContactDetailsFormData>()
  const phone = getFieldMeta<string>('phone')

  return (
    <div className="flex flex-col gap-y-6">
      <TextField
        label="Mobile number"
        value={phone.value}
        error={phone.touched ? phone.error : undefined}
        onChange={(e) => setFieldValue('phone', e.target.value)}
      />
    </div>
  )
}
```

**5. Write the submit button** as its own component using `useFormikContext`:

```tsx
const SubmitButton: FC = () => {
  const { handleSubmit, isSubmitting, isValid } = useFormikContext<ContactDetailsFormData>()

  return (
    <Button
      disabled={isSubmitting || !isValid}
      isLoading={isSubmitting}
      onClick={handleSubmit}
      type="submit"
      variant="primary"
    >
      Continue
    </Button>
  )
}
```

### Putting it together

```tsx
<Form<ContactDetailsFormData>
  initialValues={INITIAL_VALUES}
  onSubmitForm={(formData) => onboardingService.captureContactDetails(formData)}
  onSuccess={onSuccess}
  render={() => (
    <>
      <FormComponent />
      <SubmitButton />
    </>
  )}
  validationSchema={contactDetailsSchema}
/>
```

### Form rules

| Rule | Why |
|---|---|
| Never call `axios`/`api` in `onSubmitForm` | Call a service, optionally via `useMutation` inside it |
| `onSubmitForm` must return a `Promise` | `Form` chains `.then/.catch/.finally` on it |
| Zod schema goes straight into `validationSchema` | `toFormikValidationSchema` does the conversion, don't hand-write a parallel Formik validator |
| Never manage field state with `useState` | Formik context owns it |
| `initialValues` at module scope | A new object each render remounts the form |
| Disable submit on `isSubmitting \|\| !isValid` | Prevents double submission |

### `Dropdown` and `react-hook-form`

`Dropdown` (`components/molecules/dropdown/`) already has its own, unrelated
`useFormContext: true` / `Controller` wiring against `react-hook-form`, that's a
narrow, pre-existing pattern for that one component's dual controlled/uncontrolled
API, not something to extend. Don't mix `react-hook-form` into new `Form`-atom-based
forms; `Form` is Formik-based end to end.

---

## 11. Schemas (Zod)

### One schema, two jobs

A Zod schema is both the runtime validation **and** the compile-time type. Always
derive the type and never write it twice:

```ts
// schemas/onboarding-schema.ts
export const onboardingSchema = z.object({ /* … */ })
export type OnboardingFormData = z.infer<typeof onboardingSchema>
```

Nothing about writing the schema itself changes for [§11](#11-forms)'s `Form` atom,
the same schema that derives your type also goes straight into
`<Form validationSchema={onboardingSchema} />`, converted under the hood by
`zod-formik-adapter`'s `toFormikValidationSchema`. You still call `.safeParse()`
directly wherever you're validating outside a `Form` (e.g. the existing
`useState`-based forms, or one-off checks).

### Zod v4 error messages, the `{ error }` object, not a string argument

```ts
// schemas/onboarding-schema.ts
export const retrivalSchema = z.object({
  idNumber: z
    .string()
    .trim()
    .regex(/^\d{13}$/, {
      error: 'Enter a valid 13 digit South African ID number.',
    }),

  idConsent: z.literal(true, {
    error: 'Citizen consent is required before retreiving ID record.',
  }),
})

export const onboardingSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+27[678]\d{8}|0[678]\d{8})$/, {
      error: 'Enter a valid South African mobile number.\n(e.g. +27612345678 or 0612345678).',
    }),
  email: z.string().trim().email({ error: 'Enter a valid email address.' }),
  contactDetailsConsent: z.literal(true, {
    error: 'Citizen consent is required to capture contact details.',
  }),
})

export type RetriveIDRecordFormData = z.infer<typeof retrivalSchema>
export type OnboardingFormData = z.infer<typeof onboardingSchema>
```

### Where schemas live

Today, **every schema lives in `src/schemas/`** (there's currently just the one file,
`onboarding-schema.ts`, plus a barrel at `src/schemas/index.ts`), there's no
per-component `schemas.ts` convention in this codebase yet. Start there. If a schema
is genuinely local to one organism and unlikely to be reused, a `schemas.ts` file
inside that component's folder (mirroring the `types.ts` convention) is a reasonable
place to put it, just don't invent a three-tier promotion ceremony for a single-file
`schemas/` folder.

### Schema conventions

1. **Name it `<thing>Schema`**, exported as a `const`.
2. **Every rule gets a human error message** via `{ error: '...' }`.
3. **Regex South African formats live in the schema**, not scattered across
   components. e.g. the 13-digit ID regex and the `+27`/`0` mobile-number regex in
   `retrivalSchema`/`onboardingSchema` are the canonical patterns; reuse them rather
   than re-deriving your own.
4. **`z.literal(true, { error })`** is the pattern for a required consent checkbox.

## 12. Client state (Context API)

**`zustand` is a listed dependency that is not used anywhere in this app.** There is
no `store/` folder, no `create()` call, nothing imported from `'zustand'` in `src/`.
Don't reach for it, if you see it mentioned as the state solution elsewhere (including
in `docs/demo2/coding_standards.md`), that's aspirational, not current.

The real pattern for state that spans unrelated components is **React Context**, e.g.
the logged-in user:

```tsx
// context/user-context.tsx
'use client'

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
  setUser: () => {},
})

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User>(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/auth/me')
      setUser(res.data)
    } catch {
      setUser(readStoredUser())
    } finally {
      setLoading(false)
    }
  }

  // … logout(), refresh(), effect to fetchMe() on mount

  return (
    <UserContext.Provider value={{ user, loading, refresh: fetchMe, logout, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
```

Rules:

- One provider per concern, exposed through a `use<Thing>()` hook (`useUser`), not by
  exporting the raw context.
- Persist to `localStorage` yourself inside the provider when the value must survive a
  refresh, there's no `persist` middleware doing this for you the way Zustand's would.
- A provider may call a service; it must never render feature UI itself, only wrap
  `children`.
- **Local UI state stays in `useState`** in the component that owns it, don't reach
  for Context for state only one component tree needs.

---

## 13. Pull request checklist

Before you request review:

**Structure**
- [ ] Component is in its own `kebab-case` folder, in the correct atomic layer
- [ ] `'use client'` present only if the component actually needs it
- [ ] Props are in `types.ts` as `<Name>Props` (not `PropsType`)
- [ ] Added to the layer's `index.ts` barrel
- [ ] No imports from a higher layer (atom importing an organism, etc.)

**Component**
- [ ] Named export (except `app/**/page.tsx`, `layout.tsx`, and the existing
      `components/pages/*` default-export pattern)
- [ ] Accepts and merges `className` **last** via `cn`
- [ ] Props sorted alphabetically where practical
- [ ] No `console.log`

**Styling**
- [ ] All text uses `<Text variant="…" />` -> no raw `<h1>`–`<h4>`/`<p>` with font classes
- [ ] All buttons use `<Button />`
- [ ] Colours use tokens from `globals.css`, no inline hex
- [ ] Mobile styles unprefixed, desktop behind `md:`/`lg:`

**Forms**
- [ ] New forms use the `Form` atom (Formik + `zod-formik-adapter`), not raw `useState`
- [ ] Zod schema passed straight into `validationSchema`, type via `z.infer`
- [ ] Zod messages use the `{ error: '...' }` object form (Zod v4)
- [ ] `INITIAL_VALUES` is a module-level constant and typed
- [ ] Submit disabled while `isSubmitting || !isValid`

**Data**
- [ ] No `axios` outside `services/`
- [ ] URLs only in a `-urls.ts` file
- [ ] Request shaping in a DTO where the API shape differs from the app shape
- [ ] Response shaping in a model where the API shape differs from the app shape
- [ ] Query keys include every dependency

**Testing**
- [ ] Component test lives in `test/<component-name>.test.tsx` inside the folder
- [ ] Test/spec selectors use `getByRole`/`getByText`/`getByLabelText`, not CSS classes

**Finally**
- [ ] `pnpm lint`, `pnpm format:check`, `pnpm type-check` clean (lefthook runs
      lint/format on commit and a full build on push anyway)
- [ ] No unused imports or variables