import { test, expect } from '@playwright/test'

test('citizen can generate a QR code with selective disclosure', async ({
  page,
}) => {
  await page.goto('/citizen/qr')

  await expect(page.getByText('Select a credential')).toBeVisible({
    timeout: 15_000,
  })

  await page.getByRole('button', { name: "Driver's License" }).click()
  await expect(page.getByText('Choose what to share')).toBeVisible()

  const selectAllButton = page.getByRole('button', {
    name: /Select all(?: for official)?/i,
  })

  await expect(selectAllButton).toBeVisible({
    timeout: 15_000,
  })

  await selectAllButton.click()

  await expect(
    page.getByRole('button', {
      name: /All fields selected/i,
    })
  ).toBeVisible()

  await page
    .getByRole('button', {
      name: /Review and continue/i,
    })
    .click()

  await expect(page.getByText("Confirm what you're sharing")).toBeVisible()
  await page
    .getByRole('button', {
      name: /Confirm and generate QR/i,
    })
    .click()
  await expect(page.getByText(/QR Preview|Your QR Code/i)).toBeVisible({
    timeout: 15_000,
  })

  await expect(page.locator('svg').first()).toBeVisible()
  await expect(page.getByText(/Valid for \d+:\d{2}/)).toBeVisible()
})
