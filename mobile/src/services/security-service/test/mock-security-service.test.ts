import type { SecurityService } from '@/services/security-service/types'

type MockModule =
  typeof import('@/services/security-service/mock-security-service')

const MOCK_DELAY_MS = 400

const loadService = (): { alertId: string; service: SecurityService } => {
  let loaded = {} as MockModule
  jest.isolateModules(() => {
    loaded = jest.requireActual<MockModule>(
      '@/services/security-service/mock-security-service'
    )
  })
  return { alertId: loaded.MOCK_ALERT_ID, service: loaded.default }
}

const settle = async <T>(promise: Promise<T>): Promise<T> => {
  jest.advanceTimersByTime(MOCK_DELAY_MS)
  return promise
}

describe('mockSecurityService', () => {
  beforeEach(() => jest.useFakeTimers())

  afterEach(() => jest.useRealTimers())

  it('Should start with one open alert that restricts QR codes', async () => {
    const { service } = loadService()
    const overview = await settle(service.getOverview())
    expect(overview.hasActiveAlert).toBe(true)
    expect(overview.activeAlertCount).toBe(1)
    expect(overview.qrGenerationRestricted).toBe(true)
    expect(overview.recentActivity).toHaveLength(3)
  })

  it('Should close the alert everywhere once the account is secured', async () => {
    const { alertId, service } = loadService()
    const result = await settle(
      service.secureAccount(alertId, {
        action: 'LogOutOtherDevices',
        password: 'password123',
      })
    )
    expect(result.requiresPasswordChange).toBe(false)
    expect(result.alertId).toBe(alertId)

    const overview = await settle(service.getOverview())
    expect(overview.hasActiveAlert).toBe(false)

    const alert = await settle(service.getAlert(alertId))
    expect(alert.status).toBe('Secured')
    expect(alert.availableActions).toEqual([])
    expect(alert.resolvedAt).not.toBeNull()
  })

  it('Should ask for a new password after a password reset', async () => {
    const { alertId, service } = loadService()
    const result = await settle(
      service.secureAccount(alertId, {
        action: 'ResetPassword',
        password: 'password123',
      })
    )
    expect(result.requiresPasswordChange).toBe(true)
  })

  it('Should turn on extra verification when that action is chosen', async () => {
    const { alertId, service } = loadService()
    await settle(
      service.secureAccount(alertId, {
        action: 'AddExtraVerification',
        password: 'password123',
      })
    )
    const settings = await settle(service.getSettings())
    expect(settings.enhancedVerificationEnabled).toBe(true)
    expect(settings.qrGenerationRestricted).toBe(false)
  })

  it('Should mark the alert as dismissed', async () => {
    const { alertId, service } = loadService()
    await settle(service.dismissAlert(alertId, { password: 'password123' }))
    const alert = await settle(service.getAlert(alertId))
    expect(alert.status).toBe('Dismissed')
  })

  it('Should change only the settings that were sent', async () => {
    const { service } = loadService()
    const settings = await settle(
      service.updateSettings({ impossibleTravelDetectionEnabled: false })
    )
    expect(settings.impossibleTravelDetectionEnabled).toBe(false)
    expect(settings.enhancedVerificationEnabled).toBe(false)
    expect(settings.trustedDeviceCount).toBe(2)
  })

  it('Should return the activity history', async () => {
    const { service } = loadService()
    await expect(settle(service.getActivity())).resolves.toHaveLength(3)
  })
})
