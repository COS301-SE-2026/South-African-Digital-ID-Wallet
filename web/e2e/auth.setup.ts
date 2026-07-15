import { test as setup, expect } from '@playwright/test'

const roles = [
  {
    name: 'citizen',
    email: process.env.E2E_CITIZEN_EMAIL!,
    landing: '/citizen',
  },
  {
    name: 'gov-admin',
    email: process.env.E2E_GOVADMIN_EMAIL!,
    landing: '/gov-admin',
  },
  {
    name: 'officials',
    email: process.env.E2E_OFFICIAL_EMAIL!,
    landing: '/officials',
  },
]

for (const role of roles) {
  setup(`authenticate as ${role.name}`, async ({ page }) => {
    await page.goto('/')
    await page.getByLabel(/email/i).fill(role.email)
    await page.getByLabel(/password/i).fill(process.env.E2E_PASSWORD!)
    await page.getByRole('button', { name: /login|log in|sign in/i }).click()
    await expect(page).toHaveURL(new RegExp(role.landing))
    await page.context().storageState({ path: `e2e/.auth/${role.name}.json` })
  })
}
