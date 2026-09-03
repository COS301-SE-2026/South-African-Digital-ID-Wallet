import { test, expect } from '@playwright/test'

test.describe.serial('Automatic credential expiry', () => {
  test('gov admin triggers the expiry check', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'e2e/.auth/gov-admin.json',
    })
    const page = await context.newPage()
    const cookies = await context.cookies()
    const csrfToken = cookies.find((c) => c.name === 'csrf_token')?.value
    const response = await page.request.post('/api/credentials/expiry-check', {
      headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {},
    })
    expect(response.ok()).toBeTruthy()

    const body = await response.json()
    expect(body.status).toBe('Completed')

    await context.close()
  })

  test("citizen sees their driver's license as Expired with a notification", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: 'e2e/.auth/citizen-expiry.json',
    })
    const page = await context.newPage()

    await page.goto('/citizen/my-credentials')
    await page.getByRole('button', { name: "Driver's Licence" }).click()
    await expect(page.getByText('Expired', { exact: true })).toBeVisible()
    await page.goto('/citizen/citizen-dashboard')
    await expect(page.getByText("Driver's license expired")).toBeVisible()
    await context.close()
  })
})
