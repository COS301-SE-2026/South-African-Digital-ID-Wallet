import { test, expect } from '@playwright/test'

test('citizen can view their credentials and switch between them', async ({
  page,
}) => {
  await page.goto('/citizen/my-credentials')

  const tabRow = page.locator('.snap-x')
  const tabs = tabRow.getByRole('button')
  await expect(tabs.first()).toBeVisible({ timeout: 15_000 })

  const tabCount = await tabs.count()
  expect(tabCount).toBeGreaterThanOrEqual(1)

  await expect(page.getByText('Details')).toBeVisible()
  await expect(page.getByText('Issued by')).toBeVisible()
  await expect(page.getByText('Issue date')).toBeVisible()

  if (tabCount > 1) {
    const detailHeading = page.getByRole('heading', { level: 2 })
    const firstTitle = await detailHeading.textContent()

    await tabs.nth(1).click()

    await expect(detailHeading).not.toHaveText(firstTitle ?? '')
  }
})
