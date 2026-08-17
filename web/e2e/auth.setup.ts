import { test as setup, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const BACKEND_LOG = path.resolve(__dirname, '..', '..', 'backend.log')

const readLatestOtp = (): string | null => {
  if (!fs.existsSync(BACKEND_LOG)) {
    return null
  }
  const matches = [
    ...fs.readFileSync(BACKEND_LOG, 'utf-8').matchAll(/Email otp: (\d{6})\./g),
  ]
  return matches.length ? matches[matches.length - 1][1] : null
}

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
  {
    name: 'citizen-expiry',
    email: process.env.E2E_EXPIRY_CITIZEN_EMAIL,
    landing: '/citizen',
  },
]

setup.describe.serial('device-verified logins', () => {
  for (const role of roles) {
    setup(`authenticate as ${role.name}`, async ({ page }) => {
      const password = process.env.E2E_PASSWORD
      expect(role.email, `missing env var for ${role.name} email`).toBeTruthy()
      expect(password, 'missing E2E_PASSWORD').toBeTruthy()
      await page.goto('/login')
      await page.locator('#email').fill(role.email!)
      await page.locator('#password').fill(password!)
      await page.getByRole('button', { name: /^login$/i }).click()
      const needsOtp = await page
        .getByText('New Device Detected')
        .waitFor({ state: 'visible', timeout: 15_000 })
        .then(() => true)
        .catch(() => false)
      if (needsOtp) {
        const otp = readLatestOtp()
        if (!otp) {
          throw new Error(`Could not find OTP in backend.log for ${role.name}`)
        }
        const boxes = page.locator('input[maxlength="1"]')
        for (let i = 0; i < otp.length; i++) {
          await boxes.nth(i).fill(otp[i])
        }
        await page.getByRole('button', { name: /^log in$/i }).click()
      }
      await expect(page).toHaveURL(new RegExp(role.landing), {
        timeout: 15_000,
      })
      await page.context().storageState({ path: `e2e/.auth/${role.name}.json` })
    })
  }
})
