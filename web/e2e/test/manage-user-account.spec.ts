import { test, expect } from '@playwright/test'

test('citizen  can view their account information', async ({ page }) => {
  await page.goto('/citizen/manage-user-account')
  await expect(page.getByText('Full Name')).toBeVisible()
  await expect(page.getByText('Email Address', { exact: true })).toBeVisible()
  await expect(page.getByText('Account Status')).toBeVisible()

  //we still need to addd more tests here (please just check again, i found a few small bugs and jotted them down)
})
