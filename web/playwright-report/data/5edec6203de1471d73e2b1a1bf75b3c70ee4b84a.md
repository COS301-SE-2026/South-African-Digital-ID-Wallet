# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.setup.ts >> device-verified logins >> authenticate as citizen
- Location: e2e/auth.setup.ts:42:10

# Error details

```
Error: Could not find OTP in backend.log for citizen
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - generic [ref=e6]:
            - img "Flash ID" [ref=e7]
            - paragraph [ref=e9]: Prove yourself in a Flash
          - paragraph [ref=e10]: Fast. Secured.Verified.
          - paragraph [ref=e11]: Create your FlashID account and take control of your digital identity.
        - generic [ref=e12]:
          - generic [ref=e16]:
            - paragraph [ref=e17]: Instant Verification
            - paragraph [ref=e18]: Verify your identity in seconds with government-backed credentials.
          - generic [ref=e22]:
            - paragraph [ref=e23]: Government Verified
            - paragraph [ref=e24]: Trusted identity verification backed by official institutions.
          - generic [ref=e32]:
            - paragraph [ref=e33]: Secure Credential Sharing
            - paragraph [ref=e34]: Share your credentials safely with trusted banks and institutions.
          - generic [ref=e40]:
            - paragraph [ref=e41]: Trusted by citizens. Secured for you.
            - paragraph [ref=e42]: Proudly South African
      - generic [ref=e44]:
        - link [ref=e46] [cursor=pointer]:
          - /url: /
          - button "Back" [ref=e47]
        - generic [ref=e48]:
          - paragraph [ref=e49]: Welcome back
          - paragraph [ref=e50]: Log into your FlashID account.
        - generic [ref=e51]:
          - generic [ref=e52]:
            - generic [ref=e53]:
              - generic [ref=e54]: "Email:"
              - textbox "Email:" [ref=e55]: citizen.e2e@flashid.local
            - generic [ref=e56]:
              - generic [ref=e57]: "Password:"
              - generic [ref=e58]:
                - textbox "Password:" [ref=e59]: password123
                - button "Show password" [ref=e60]
            - generic [ref=e64]:
              - checkbox "Remember me" [ref=e65]
              - generic [ref=e66]: Remember me
            - generic [ref=e67]:
              - button "Login" [ref=e68]
              - generic [ref=e72]:
                - link "Forgot password?" [ref=e73] [cursor=pointer]:
                  - /url: "#"
                - paragraph [ref=e74]:
                  - text: Don't have an account?
                  - link "Register" [ref=e75] [cursor=pointer]:
                    - /url: /register
          - generic [ref=e77]:
            - generic [ref=e78]:
              - heading "Verify New Device" [level=2] [ref=e79]
              - button [ref=e80]
            - generic [ref=e85]:
              - generic [ref=e91]:
                - heading "New Device Detected" [level=3] [ref=e92]
                - paragraph [ref=e93]: Enter the 6-digit verification code sent to your email.
              - generic [ref=e94]:
                - textbox [ref=e95]
                - textbox [ref=e96]
                - textbox [ref=e97]
                - textbox [ref=e98]
                - textbox [ref=e99]
                - textbox [ref=e100]
              - button "Log In" [disabled] [ref=e102]
              - button "Resend code" [ref=e104]
            - button "Close" [ref=e111]
  - status [ref=e117]: Enter the verification code sent to your email.
  - button "Open Tanstack query devtools" [ref=e168] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e222] [cursor=pointer]
  - alert [ref=e226]
```

# Test source

```ts
  1  | import { test as setup, expect } from '@playwright/test'
  2  | import fs from 'node:fs'
  3  | import path from 'node:path'
  4  | 
  5  | const BACKEND_LOG = path.resolve(__dirname, '..', '..', 'backend.log')
  6  | 
  7  | const readLatestOtp = (): string | null => {
  8  |   if (!fs.existsSync(BACKEND_LOG)) {
  9  |     return null
  10 |   }
  11 |   const matches = [
  12 |     ...fs.readFileSync(BACKEND_LOG, 'utf-8').matchAll(/Email otp: (\d{6})\./g),
  13 |   ]
  14 |   return matches.length ? matches[matches.length - 1][1] : null
  15 | }
  16 | 
  17 | const roles = [
  18 |   {
  19 |     name: 'citizen',
  20 |     email: process.env.E2E_CITIZEN_EMAIL,
  21 |     landing: '/citizen',
  22 |   },
  23 |   {
  24 |     name: 'gov-admin',
  25 |     email: process.env.E2E_GOVADMIN_EMAIL,
  26 |     landing: '/gov-admin',
  27 |   },
  28 |   {
  29 |     name: 'officials',
  30 |     email: process.env.E2E_OFFICIAL_EMAIL,
  31 |     landing: '/officials',
  32 |   },
  33 |   {
  34 |     name: 'citizen-expiry',
  35 |     email: process.env.E2E_EXPIRY_CITIZEN_EMAIL,
  36 |     landing: '/citizen',
  37 |   },
  38 | ]
  39 | 
  40 | setup.describe.serial('device-verified logins', () => {
  41 |   for (const role of roles) {
  42 |     setup(`authenticate as ${role.name}`, async ({ page }) => {
  43 |       const password = process.env.E2E_PASSWORD
  44 |       expect(role.email, `missing env var for ${role.name} email`).toBeTruthy()
  45 |       expect(password, 'missing E2E_PASSWORD').toBeTruthy()
  46 |       await page.goto('/login')
  47 |       await page.locator('#email').fill(role.email!)
  48 |       await page.locator('#password').fill(password!)
  49 |       await page.getByRole('button', { name: /^login$/i }).click()
  50 |       const needsOtp = await page
  51 |         .getByText('New Device Detected')
  52 |         .waitFor({ state: 'visible', timeout: 15_000 })
  53 |         .then(() => true)
  54 |         .catch(() => false)
  55 |       if (needsOtp) {
  56 |         const otp = readLatestOtp()
  57 |         if (!otp) {
> 58 |           throw new Error(`Could not find OTP in backend.log for ${role.name}`)
     |                 ^ Error: Could not find OTP in backend.log for citizen
  59 |         }
  60 |         const boxes = page.locator('input[maxlength="1"]')
  61 |         for (let i = 0; i < otp.length; i++) {
  62 |           await boxes.nth(i).fill(otp[i])
  63 |         }
  64 |         await page.getByRole('button', { name: /^log in$/i }).click()
  65 |       }
  66 |       await expect(page).toHaveURL(new RegExp(role.landing), {
  67 |         timeout: 15_000,
  68 |       })
  69 |       await page.context().storageState({ path: `e2e/.auth/${role.name}.json` })
  70 |     })
  71 |   }
  72 | })
  73 | 
```