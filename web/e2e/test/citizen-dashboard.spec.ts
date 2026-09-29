import { test, expect } from '@playwright/test'

test('citizen lands on their dashboard', async ({ page }) => {
  await page.goto('/citizen')
  await expect(page).toHaveURL(/\/citizen/)
})
