import api from '@/lib/api'

import citizenDashboardService from '../citizen-dashboard-service'
import citizenDashboardUrls from '../citizen-dashboard-urls'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
  setAuthToken: jest.fn(),
}))

const mockedGet = api.get as jest.Mock
const CREDS_ENDPOINT = '/api/credentials/me'
const ACTIVITY_ENDPOINT = '/api/activity/me'
const MOCK_CRED_DATA = [{ id: 'c-1' }]
const MOCK_ACTIVITY_DATA = [{ id: 'a-1' }]
const NETWORK_ERROR = new Error('offline')

describe('citizenDashboardService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should request the citizen credentials endpoint and unwrap data', async () => {
    mockedGet.mockResolvedValueOnce({ data: MOCK_CRED_DATA })
    const result = await citizenDashboardService.getCredentials()
    expect(result).toEqual(MOCK_CRED_DATA)
    expect(mockedGet).toHaveBeenCalledWith(CREDS_ENDPOINT)
  })
  it('Should request the citizen activity endpoint and unwrap data', async () => {
    mockedGet.mockResolvedValueOnce({ data: MOCK_ACTIVITY_DATA })
    const result = await citizenDashboardService.getActivity()
    expect(result).toEqual(MOCK_ACTIVITY_DATA)
    expect(mockedGet).toHaveBeenCalledWith(ACTIVITY_ENDPOINT)
  })
  it('Should propagate request failures to the caller', async () => {
    mockedGet.mockRejectedValueOnce(NETWORK_ERROR)
    await expect(citizenDashboardService.getActivity()).rejects.toThrow(
      'offline'
    )
  })
})

describe('citizenDashboardUrls', () => {
  it('Should build stable endpoint paths', () => {
    expect(citizenDashboardUrls.credentials()).toBe('/api/credentials/me')
    expect(citizenDashboardUrls.activity()).toBe('/api/activity/me')
  })
})
