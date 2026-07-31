import { test, expect } from '@playwright/test'
import QRCode from 'qrcode'

test('official can scan a citizen QR code and see verified fields', async ({
  browser,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Fake camera feed only supported on Chromium'
  )

  const citizenContext = await browser.newContext({
    storageState: 'e2e/.auth/citizen.json',
  })
  const citizenPage = await citizenContext.newPage()

  await citizenPage.goto('/citizen/qr')
  await expect(
    citizenPage.getByRole('button', { name: "Driver's License" })
  ).toBeVisible({ timeout: 15_000 })
  await citizenPage.getByRole('button', { name: "Driver's License" }).click()
  await citizenPage
    .getByRole('button', { name: 'Select all for official' })
    .click()
  await citizenPage.getByRole('button', { name: 'Review and continue' }).click()

  const [response] = await Promise.all([
    citizenPage.waitForResponse(
      (res) =>
        res.url().includes('/qr-token') && res.request().method() === 'POST'
    ),
    citizenPage
      .getByRole('button', { name: 'Confirm and generate QR' })
      .click(),
  ])

  const { token } = (await response.json()) as { token: string }
  expect(token).toBeTruthy()

  await citizenContext.close()

  const qrDataUrl = await QRCode.toDataURL(token, {
    margin: 2,
    width: 800,
    errorCorrectionLevel: 'M',
  })

  const officialsContext = await browser.newContext({
    storageState: 'e2e/.auth/officials.json',
  })
  await officialsContext.grantPermissions(['camera'])
  const officialsPage = await officialsContext.newPage()

  officialsPage.on('console', (msg) => console.log('[browser]', msg.text()))

  await officialsPage.addInitScript((dataUrl: string) => {
    const fakeGetUserMedia = async () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1200
      canvas.height = 1200
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const img = new Image()
      img.src = dataUrl
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('QR image failed to load'))
      })

      const offsetX = (canvas.width - img.width) / 2
      const offsetY = (canvas.height - img.height) / 2

      const draw = () => {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, offsetX, offsetY)
        requestAnimationFrame(draw)
      }
      draw()

      const stream = (
        canvas as HTMLCanvasElement & {
          captureStream: (fps?: number) => MediaStream
        }
      ).captureStream(15)

      console.log(
        '[fake-camera] stream ready, tracks:',
        stream.getTracks().length
      )
      return stream
    }

    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      value: fakeGetUserMedia,
      writable: true,
    })
  }, qrDataUrl)
  await officialsPage.goto('/officials/verifications')

  await expect(officialsPage.getByText('Verified credentials')).toBeVisible({
    timeout: 20_000,
  })

  await officialsContext.close()
})
