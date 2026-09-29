import api from '@/lib/api'
import securityService from '@/services/security-service/security-service'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}))

const getMock = api.get as jest.Mock
const postMock = api.post as jest.Mock
const putMock = api.put as jest.Mock

const ALERT_ID = 'alert 1'

describe('securityService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should fetch the overview and unwrap the data', async () => {
    getMock.mockResolvedValue({ data: { hasActiveAlert: true } })
    await expect(securityService.getOverview()).resolves.toEqual({
      hasActiveAlert: true,
    })
    expect(getMock).toHaveBeenCalledWith('/api/security/overview')
  })

  it('Should request twenty activity items by default', async () => {
    getMock.mockResolvedValue({ data: [] })
    await securityService.getActivity()
    expect(getMock).toHaveBeenCalledWith('/api/security/activity?limit=20')
  })

  it('Should pass a custom activity limit', async () => {
    getMock.mockResolvedValue({ data: [] })
    await securityService.getActivity(5)
    expect(getMock).toHaveBeenCalledWith('/api/security/activity?limit=5')
  })

  it('Should encode the alert id when fetching an alert', async () => {
    getMock.mockResolvedValue({ data: { id: ALERT_ID } })
    await expect(securityService.getAlert(ALERT_ID)).resolves.toEqual({
      id: ALERT_ID,
    })
    expect(getMock).toHaveBeenCalledWith('/api/security/alerts/alert%201')
  })

  it('Should post the chosen action and password when securing', async () => {
    postMock.mockResolvedValue({ data: { title: 'Your account is secured' } })
    const request = {
      action: 'LogOutOtherDevices' as const,
      password: 'password123',
    }
    await expect(
      securityService.secureAccount(ALERT_ID, request)
    ).resolves.toEqual({ title: 'Your account is secured' })
    expect(postMock).toHaveBeenCalledWith(
      '/api/security/alerts/alert%201/secure',
      request
    )
  })

  it('Should post the password when dismissing and resolve with nothing', async () => {
    postMock.mockResolvedValue({ data: '' })
    await expect(
      securityService.dismissAlert(ALERT_ID, { password: 'password123' })
    ).resolves.toBeUndefined()
    expect(postMock).toHaveBeenCalledWith(
      '/api/security/alerts/alert%201/dismiss',
      { password: 'password123' }
    )
  })

  it('Should fetch the security settings', async () => {
    getMock.mockResolvedValue({ data: { trustedDeviceCount: 2 } })
    await expect(securityService.getSettings()).resolves.toEqual({
      trustedDeviceCount: 2,
    })
    expect(getMock).toHaveBeenCalledWith('/api/security/settings')
  })

  it('Should put a settings change and return the new settings', async () => {
    putMock.mockResolvedValue({
      data: { impossibleTravelDetectionEnabled: false },
    })
    const request = {
      impossibleTravelDetectionEnabled: false,
      password: 'password123',
    }
    await expect(securityService.updateSettings(request)).resolves.toEqual({
      impossibleTravelDetectionEnabled: false,
    })
    expect(putMock).toHaveBeenCalledWith('/api/security/settings', request)
  })

  it('Should propagate transport failures to the caller', async () => {
    getMock.mockRejectedValue(new Error('network down'))
    await expect(securityService.getOverview()).rejects.toThrow('network down')
  })
})
