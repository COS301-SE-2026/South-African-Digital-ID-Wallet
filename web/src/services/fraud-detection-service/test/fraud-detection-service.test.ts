import api from '@/lib/api'
import fraudDetectionService from '../fraud-detection-service'
import type {
  FraudAlertSummaryResponse,
  SecurityActivityItemResponse,
} from '../types'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}))
const mockedApi = api as unknown as {
  get: jest.Mock
  post: jest.Mock
  put: jest.Mock
}
describe('fraudDetectionService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('gets the security overview', async () => {
    const data = {
      hasActiveAlert: true,
      activeAlertCount: 1,
      latestAlert: null,
      qrGenerationRestricted: false,
      qrRestrictedUntil: null,
      recentActivity: [],
    }
    mockedApi.get.mockResolvedValue({ data })
    const result = await fraudDetectionService.getOverview()
    expect(mockedApi.get).toHaveBeenCalledWith('/api/security/overview')
    expect(result).toEqual(data)
  })
  it('gets activity using the default limit', async () => {
    const data: SecurityActivityItemResponse[] = []
    mockedApi.get.mockResolvedValue({ data })
    const result = await fraudDetectionService.getActivity()
    expect(mockedApi.get).toHaveBeenCalledWith(
      '/api/security/activity?limit=20'
    )
    expect(result).toEqual(data)
  })
  it('gets activity using a supplied limit', async () => {
    const data: SecurityActivityItemResponse[] = []
    mockedApi.get.mockResolvedValue({ data })
    await fraudDetectionService.getActivity(5)
    expect(mockedApi.get).toHaveBeenCalledWith('/api/security/activity?limit=5')
    expect(data).toEqual([])
  })
  it('gets alerts without a status filter', async () => {
    const data: FraudAlertSummaryResponse[] = []
    mockedApi.get.mockResolvedValue({ data })
    const result = await fraudDetectionService.getAlerts()
    expect(mockedApi.get).toHaveBeenCalledWith('/api/security/alerts')
    expect(result).toEqual(data)
  })
  it('gets alerts with a status filter', async () => {
    const data: FraudAlertSummaryResponse[] = []
    mockedApi.get.mockResolvedValue({ data })
    await fraudDetectionService.getAlerts('Open')
    expect(mockedApi.get).toHaveBeenCalledWith(
      '/api/security/alerts?status=Open'
    )
    expect(data).toEqual([])
  })
  it('gets alert details', async () => {
    const data = {
      id: 'alert-123',
      title: 'Suspicious login',
    }
    mockedApi.get.mockResolvedValue({ data })
    const result = await fraudDetectionService.getAlertDetails('alert-123')
    expect(mockedApi.get).toHaveBeenCalledWith('/api/security/alerts/alert-123')
    expect(result).toEqual(data)
  })
  it('secures an account', async () => {
    const request = {
      action: 'ResetPassword' as const,
      password: 'Password123!',
    }
    const data = {
      alertId: 'alert-123',
      action: 'ResetPassword',
      title: 'Account secured',
      message: 'Your account has been secured.',
      nextSteps: ['Sign in again'],
      devicesRemoved: 2,
      requiresPasswordChange: true,
    }
    mockedApi.post.mockResolvedValue({ data })
    const result = await fraudDetectionService.secureAccount(
      'alert-123',
      request
    )
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/api/security/alerts/alert-123/secure',
      request
    )
    expect(result).toEqual(data)
  })
  it('dismisses an alert', async () => {
    const request = {
      password: 'Password123!',
    }
    mockedApi.post.mockResolvedValue({ data: {} })
    const result = await fraudDetectionService.dismissAlert(
      'alert-123',
      request
    )
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/api/security/alerts/alert-123/dismiss',
      request
    )
    expect(result).toBeUndefined()
  })
  it('gets security settings', async () => {
    const data = {
      deviceVerificationEnabled: true,
      enhancedVerificationEnabled: false,
      impossibleTravelDetectionEnabled: true,
      trustedDeviceCount: 2,
      qrGenerationRestricted: false,
      qrRestrictedUntil: null,
    }
    mockedApi.get.mockResolvedValue({ data })
    const result = await fraudDetectionService.getSettings()
    expect(mockedApi.get).toHaveBeenCalledWith('/api/security/settings')
    expect(result).toEqual(data)
  })
  it('updates security settings', async () => {
    const request = {
      impossibleTravelDetectionEnabled: false,
      enhancedVerificationEnabled: true,
      password: 'Password123!',
    }
    const data = {
      deviceVerificationEnabled: true,
      enhancedVerificationEnabled: true,
      impossibleTravelDetectionEnabled: false,
      trustedDeviceCount: 2,
      qrGenerationRestricted: false,
      qrRestrictedUntil: null,
    }
    mockedApi.put.mockResolvedValue({ data })
    const result = await fraudDetectionService.updateSettings(request)
    expect(mockedApi.put).toHaveBeenCalledWith(
      '/api/security/settings',
      request
    )
    expect(result).toEqual(data)
  })
  it('propagates API errors', async () => {
    mockedApi.get.mockRejectedValue(new Error('Network error'))
    await expect(fraudDetectionService.getOverview()).rejects.toThrow(
      'Network error'
    )
  })
})
