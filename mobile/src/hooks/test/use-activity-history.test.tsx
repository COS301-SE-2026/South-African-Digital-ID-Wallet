import { act, renderHook, waitFor } from '@testing-library/react-native'

import { createQueryWrapper } from '@/test/utils/render-with-providers'
import { citizenDashboardService } from '@/services/citizen-dashboard-service'
import { useAuthStore } from '@/stores/auth-store'

import { useActivityHistory } from '../use-activity-history'

jest.mock(
  '@/services/citizen-dashboard-service/citizen-dashboard-service',
  () => ({
    __esModule: true,
    default: {
      getActivity: jest.fn(),
      getCredentials: jest.fn(),
      getOfficialActivity: jest.fn(),
    },
  })
)
jest.mock('@/lib/secure-session', () => ({
  clearSession: jest.fn().mockResolvedValue(undefined),
  loadSession: jest.fn().mockResolvedValue(null),
  saveSession: jest.fn().mockResolvedValue(undefined),
}))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
  setAuthToken: jest.fn(),
  setDeviceToken: jest.fn(),
}))

const getActivity = citizenDashboardService.getActivity as jest.Mock
const getOfficialActivity =
  citizenDashboardService.getOfficialActivity as jest.Mock

const initial = useAuthStore.getState()

const ACTIVITY = [
  {
    id: 'a-1',
    timestamp: new Date().toISOString(),
    title: 'Mobile App',
    type: 'UserLoggedIn',
  },
]

const signInAs = (role: string) =>
  useAuthStore.getState().signIn({
    expiresAt: '2099-01-01T00:00:00Z',
    names: 'Thabo',
    role,
    surname: 'Mokoena',
    token: 'jwt',
    userId: 'u-1',
  })

describe('useActivityHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.setState(initial, true)
    getActivity.mockResolvedValue(ACTIVITY)
    getOfficialActivity.mockResolvedValue([])
  })

  it('Should default both filters to all', async () => {
    const { result } = await renderHook(() => useActivityHistory(), {
      wrapper: createQueryWrapper(),
    })
    expect(result.current.category).toBe('all')
    expect(result.current.range).toBe('all')
  })
  it('Should read the citizen activity endpoint for a citizen', async () => {
    signInAs('citizen')
    const { result } = await renderHook(() => useActivityHistory(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.groups.length).toBeGreaterThan(0))
    expect(getActivity).toHaveBeenCalled()
    expect(getOfficialActivity).not.toHaveBeenCalled()
  })
  it('Should read the official activity endpoint for an official', async () => {
    signInAs('official')
    await renderHook(() => useActivityHistory(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(getOfficialActivity).toHaveBeenCalled())
    expect(getActivity).not.toHaveBeenCalled()
  })
  it('Should update the category filter', async () => {
    signInAs('citizen')
    const { result } = await renderHook(() => useActivityHistory(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      result.current.setCategory('share')
    })
    expect(result.current.category).toBe('share')
  })
  it('Should update the range filter', async () => {
    signInAs('citizen')
    const { result } = await renderHook(() => useActivityHistory(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      result.current.setRange('7d')
    })
    expect(result.current.range).toBe('7d')
  })
  it('Should surface an error and keep the groups empty', async () => {
    signInAs('citizen')
    getActivity.mockRejectedValue(new Error('boom'))
    const { result } = await renderHook(() => useActivityHistory(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.groups).toEqual([])
  })
})
