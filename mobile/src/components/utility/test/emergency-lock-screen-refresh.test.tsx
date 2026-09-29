import { act, render } from '@testing-library/react-native'
import { AppState, Platform, type AppStateStatus } from 'react-native'

import FlashidEmergency from '@/../modules/flashid-emergency'
import { useNetworkStatus } from '@/hooks/use-network-status'
import { emergencyService } from '@/services/emergency-service'
import { useAuthStore } from '@/stores/auth-store'

import { EmergencyLockScreenRefresh } from '../emergency-lock-screen-refresh'

jest.mock('@/hooks/use-network-status', () => ({ useNetworkStatus: jest.fn() }))
jest.mock('@/services/emergency-service', () => ({
  emergencyService: { getOfflineCredential: jest.fn() },
}))
jest.mock('@/../modules/flashid-emergency', () => ({
  __esModule: true,
  default: { isConfigured: jest.fn(), setOfflineBundle: jest.fn() },
}))

const networkMock = useNetworkStatus as jest.Mock
const credentialMock = emergencyService.getOfflineCredential as jest.Mock
const isConfiguredMock = FlashidEmergency.isConfigured as jest.Mock
const setBundleMock = FlashidEmergency.setOfflineBundle as jest.Mock
const initialAuthState = useAuthStore.getState()
const originalOS = Platform.OS

const signIn = (role: string) =>
  useAuthStore.setState({
    ...initialAuthState,
    isAuthenticated: true,
    user: { userId: 'user-1', role, names: 'Thandiwe', surname: 'Dlamini' },
  })

describe('EmergencyLockScreenRefresh', () => {
  let appStateListener: (state: AppStateStatus) => void = () => {}
  let now = 1_790_000_000_000

  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => 'android',
    })
    signIn('Citizen')
    networkMock.mockReturnValue({ isOnline: true })
    isConfiguredMock.mockResolvedValue(true)
    credentialMock.mockResolvedValue({
      expiresAt: '2026-10-28',
      sdJwt: 'a.b.c~',
    })
    setBundleMock.mockResolvedValue(undefined)
    jest.spyOn(Date, 'now').mockImplementation(() => now)
    jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_, listener) => {
        appStateListener = listener
        return { remove: jest.fn() }
      })
  })

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => originalOS,
    })
    useAuthStore.setState(initialAuthState, true)
    jest.restoreAllMocks()
  })

  it('Should refresh the lock-screen code when a citizen opens the app online', async () => {
    await render(<EmergencyLockScreenRefresh />)
    await act(async () => {})
    expect(setBundleMock).toHaveBeenCalledWith('a.b.c~')
  })

  it('Should refresh again on return to the app only after six hours', async () => {
    await render(<EmergencyLockScreenRefresh />)
    await act(async () => {})

    await act(async () => appStateListener('active'))
    expect(credentialMock).toHaveBeenCalledTimes(1)

    now += 6 * 60 * 60 * 1000
    await act(async () => appStateListener('active'))
    expect(credentialMock).toHaveBeenCalledTimes(2)
  })

  it('Should try again on the next return to the app after a failed refresh', async () => {
    credentialMock.mockRejectedValueOnce(new Error('offline'))
    await render(<EmergencyLockScreenRefresh />)
    await act(async () => {})

    await act(async () => appStateListener('active'))
    expect(credentialMock).toHaveBeenCalledTimes(2)
  })

  it('Should do nothing on a phone that is not set up', async () => {
    isConfiguredMock.mockResolvedValue(false)
    await render(<EmergencyLockScreenRefresh />)
    await act(async () => {})
    expect(credentialMock).not.toHaveBeenCalled()
  })

  it('Should do nothing for an official', async () => {
    signIn('Official')
    await render(<EmergencyLockScreenRefresh />)
    await act(async () => {})
    expect(isConfiguredMock).not.toHaveBeenCalled()
  })

  it('Should wait for signal', async () => {
    networkMock.mockReturnValue({ isOnline: false })
    await render(<EmergencyLockScreenRefresh />)
    await act(async () => {})
    expect(isConfiguredMock).not.toHaveBeenCalled()
  })
})
