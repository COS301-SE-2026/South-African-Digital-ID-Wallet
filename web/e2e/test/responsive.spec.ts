import { test, expect, type Page } from '@playwright/test'

// NFR4.5: one phone, one tablet and one desktop width
const VIEWPORTS = [
  { label: 'phone', width: 375, height: 812 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'desktop', width: 1440, height: 900 },
]

// Tailwind lg breakpoint: below it the sidebar is replaced by a menu button
const SIDEBAR_MIN_WIDTH = 1024

// each portal page, and one sidebar link that must still work from it
const PORTAL_PAGES = [
  {
    role: 'citizen',
    path: '/citizen/citizen-dashboard',
    navTo: 'My Credentials',
    lands: /my-credentials/,
  },
  {
    role: 'citizen',
    path: '/citizen/my-credentials',
    navTo: 'Verifications',
    lands: /citizen\/verifications/,
  },
  {
    role: 'citizen',
    path: '/citizen/verifications',
    navTo: 'Manage Account',
    lands: /manage-user-account/,
  },
  {
    role: 'officials',
    path: '/officials/officials-dashboard',
    navTo: 'Onboard Citizen',
    lands: /onboard-citizen/,
  },
  {
    role: 'officials',
    path: '/officials/onboard-citizen',
    navTo: 'Verifications',
    lands: /officials\/verifications/,
  },
  {
    role: 'gov-admin',
    path: '/gov-admin/gov-admin-dashboard',
    navTo: 'View Institutions',
    lands: /view-institutions/,
  },
]

// px the page, or the portal content area, would scroll sideways (0 means it fits)
const sidewaysOverflow = (page: Page) =>
  page.evaluate(() => {
    const scrollers = [
      document.documentElement,
      ...document.querySelectorAll('[data-testid="page-content"]'),
    ]
    return Math.max(...scrollers.map((el) => el.scrollWidth - el.clientWidth))
  })

for (const viewport of VIEWPORTS) {
  test.describe(`NFR4.5 at ${viewport.label} width (${viewport.width}px)`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    test.describe('public pages', () => {
      // logged out, otherwise /login redirects to the dashboard
      test.use({ storageState: { cookies: [], origins: [] } })

      test('landing keeps login and register reachable', async ({ page }) => {
        await page.goto('/')
        const header = page.getByRole('banner')
        await expect(
          header.getByRole('link', { name: 'Login' })
        ).toBeInViewport()
        await expect(
          header.getByRole('link', { name: /Register/ })
        ).toBeInViewport()
        expect(await sidewaysOverflow(page)).toBeLessThanOrEqual(0)
      })

      test('login form fits and can be submitted', async ({ page }) => {
        await page.goto('/login')
        await expect(page.locator('#email')).toBeInViewport()
        await expect(page.locator('#password')).toBeVisible()
        await expect(
          page.getByRole('button', { name: /^login$/i })
        ).toBeVisible()
        expect(await sidewaysOverflow(page)).toBeLessThanOrEqual(0)
      })

      test('register form fits and can be submitted', async ({ page }) => {
        await page.goto('/register')
        const submit = page.locator('form button[type="submit"]')
        await submit.scrollIntoViewIfNeeded()
        await expect(submit).toBeInViewport()
        expect(await sidewaysOverflow(page)).toBeLessThanOrEqual(0)
      })
    })

    for (const p of PORTAL_PAGES) {
      test.describe(`${p.role} ${p.path}`, () => {
        test.use({ storageState: `e2e/.auth/${p.role}.json` })

        test('fits the screen and its navigation still works', async ({
          page,
        }) => {
          await page.goto(p.path)
          // measure only after the page's data has rendered
          await page.waitForLoadState('networkidle')
          expect(
            await sidewaysOverflow(page),
            'sideways overflow in px'
          ).toBeLessThanOrEqual(0)

          // phone and tablet reach the sidebar links through the menu button
          const narrow = viewport.width < SIDEBAR_MIN_WIDTH
          if (narrow) {
            await page
              .getByRole('button', { name: 'Open navigation menu' })
              .click()
          }
          const nav = narrow ? page.getByRole('dialog') : page
          await nav
            .getByRole('link', { name: p.navTo, exact: true })
            .first()
            .click()
          await expect(page).toHaveURL(p.lands)
        })
      })
    }

    test.describe('share credential', () => {
      test.use({ storageState: 'e2e/.auth/citizen.json' })

      test('share dialog fits and the generate button is reachable', async ({
        page,
      }) => {
        await page.goto('/citizen/my-credentials')
        await page.getByRole('button', { name: /Share Credential/ }).click()
        const dialog = page.getByRole('dialog')
        await expect(dialog).toBeVisible()

        // the dialog itself must not be wider than the screen
        const box = await dialog.boundingBox()
        expect(box!.x).toBeGreaterThanOrEqual(0)
        expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width)

        const generate = dialog.getByRole('button', {
          name: 'Generate QR code',
        })
        await generate.scrollIntoViewIfNeeded()
        await expect(generate).toBeInViewport()
      })
    })
  })
}
