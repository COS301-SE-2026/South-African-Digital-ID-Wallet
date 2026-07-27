import { test as setup, expect } from '@playwright/test'

const roles = [
  {
    name: 'citizen',
    email: process.env.E2E_CITIZEN_EMAIL,
    landing: '/citizen',
  },
  {
    name: 'gov-admin',
    email: process.env.E2E_GOVADMIN_EMAIL,
    landing: '/gov-admin',
  },
  {
    name: 'officials',
    email: process.env.E2E_OFFICIAL_EMAIL,
    landing: '/officials',
  },
]

for (const role of roles) {
  setup(`authenticate as ${role.name}`, async ({ page }) => {
    const password = process.env.E2E_PASSWORD
    expect(role.email, `missing env var for ${role.name} email`).toBeTruthy()
    expect(password, 'missing E2E_PASSWORD').toBeTruthy()
    await page.goto('/login')
    await page.locator('#email').fill(role.email!)
    await page.locator('#password').fill(password!)
    await page.getByRole('button', { name: /^login$/i }).click()
    await expect(page).toHaveURL(new RegExp(role.landing), { timeout: 15_000 })
    await page.context().storageState({ path: `e2e/.auth/${role.name}.json` })
  })
}
