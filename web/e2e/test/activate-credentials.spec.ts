import { test, expect } from '@playwright/test'

test('citizen sees a validation error for an incorrect activation PIN', async ({
  page,
}) => {
  await page.goto(
    '/citizen/activate-credentials?token=FLASHID-SEED-ACTIVATION-TOKEN'
  )

  await expect(
    page.getByText('Verify your identity', { exact: true })
  ).toBeVisible()

  await page.locator('#sa-id').fill('9901015009087')

  await page.locator('[data-slot="input-otp"]').fill('000000')

  await page.getByRole('button', { name: 'Verify & Continue' }).click()

  await expect(
    page.getByText('Could not verify your details. Please check and try again.')
  ).toBeVisible()
})
