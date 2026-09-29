import { test, expect } from '@playwright/test'

test('citizen can view their credentials and switch between them', async ({
  page,
}) => {
  await page.goto('/citizen/my-credentials')

  const credentialTabs = page.getByRole('button', {
    name: /Driver's License|Identity|Passport|Credential/i,
  })

  await expect(credentialTabs.first()).toBeVisible({
    timeout: 15_000,
  })

  const tabCount = await credentialTabs.count()
  expect(tabCount).toBeGreaterThanOrEqual(1)

  await expect(page.getByText('Details')).toBeVisible()
  await expect(page.getByText('Issued by', { exact: true })).toBeVisible()
  await expect(page.getByText('Issue date', { exact: true })).toBeVisible()

  if (tabCount > 1) {
    const detailHeading = page.getByRole('heading', {
      level: 2,
    })
    const firstTitle = await detailHeading.textContent()
    await credentialTabs.nth(1).click()
    await expect(detailHeading).not.toHaveText(firstTitle ?? '')
  }
})
