import { test, expect } from '@playwright/test'

test.describe.serial('Automatic credential expiry', () => {
  test('gov admin triggers the expiry check', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'e2e/.auth/gov-admin.json',
    })
    const page = await context.newPage()
    const cookies = await context.cookies()
    console.log(
      'COOKIES:',
      cookies.map(
        (c) =>
          `${c.name}=${c.value.slice(0, 8)}... (domain=${c.domain}, path=${c.path})`
      )
    )
    const csrfToken = cookies.find((c) => c.name === 'csrf_token')?.value
    const decodedCsrfToken = csrfToken
      ? decodeURIComponent(csrfToken)
      : undefined
    console.log('CSRF TOKEN FOUND:', csrfToken ?? 'NONE')
    const response = await page.request.post('/api/credentials/expiry-check', {
      headers: decodedCsrfToken ? { 'X-CSRF-Token': decodedCsrfToken } : {},
    })

    if (!response.ok()) {
      console.log('STATUS:', response.status())
      console.log('BODY:', await response.text())
    }
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
