import { test, expect } from '@playwright/test'

test('citizen can generate a QR code with selective disclosure', async ({
  page,
}) => {
  await page.goto('/citizen/qr')

  await expect(page.getByText('Select a credential')).toBeVisible()
  await page.getByRole('button', { name: "Driver's License" }).click()

  await expect(page.getByText('Choose what to share')).toBeVisible()
  await page.getByRole('button', { name: 'Select all for official' }).click()
  await expect(
    page.getByRole('button', { name: 'All fields selected' })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Review and continue' }).click()

  await expect(page.getByText("Confirm what you're sharing")).toBeVisible()
  await page.getByRole('button', { name: 'Confirm and generate QR' }).click()

  await expect(page.getByText('Your QR Code')).toBeVisible()
  await expect(page.locator('svg').first()).toBeVisible()
  await expect(page.getByText(/Valid for \d+:\d{2}/)).toBeVisible()
})
