import { act, render } from '@testing-library/react-native'
import { AppState, type AppStateStatus } from 'react-native'
import { useNetworkStatus } from '@/hooks/use-network-status'
import { offlineService } from '@/services/offline-service'
import { useAuthStore } from '@/stores/auth-store'
import { OfflineVerificationSync } from '../offline-verification-sync'

jest.mock('@/hooks/use-network-status', () => ({ useNetworkStatus: jest.fn() }))
jest.mock('@/services/offline-service', () => ({
  offlineService: { syncOfflineVerifications: jest.fn() },
}))

const networkMock = useNetworkStatus as jest.Mock
const syncMock = offlineService.syncOfflineVerifications as jest.Mock
const initialAuthState = useAuthStore.getState()

describe('OfflineVerificationSync', () => {
  let appStateListener: (state: AppStateStatus) => void = () => {}

  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.setState({ ...initialAuthState, isAuthenticated: true })
    networkMock.mockReturnValue({ isOnline: true })
    syncMock.mockResolvedValue(0)
    jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_, listener) => {
        appStateListener = listener
        return { remove: jest.fn() }
      })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('Should upload queued scans when signed in with signal', async () => {
    await render(<OfflineVerificationSync />)

    expect(syncMock).toHaveBeenCalledTimes(1)
  })

  it('Should not upload while offline', async () => {
    networkMock.mockReturnValue({ isOnline: false })

    await render(<OfflineVerificationSync />)

    expect(syncMock).not.toHaveBeenCalled()
  })

  it('Should not upload when nobody is signed in', async () => {
    useAuthStore.setState({ isAuthenticated: false })

    await render(<OfflineVerificationSync />)

    expect(syncMock).not.toHaveBeenCalled()
  })

  it('Should upload again when the app returns to the foreground', async () => {
    await render(<OfflineVerificationSync />)

    await act(async () => appStateListener('active'))

    expect(syncMock).toHaveBeenCalledTimes(2)
  })

  it('Should upload once signal returns', async () => {
    networkMock.mockReturnValue({ isOnline: false })
    const { rerender } = await render(<OfflineVerificationSync />)

    networkMock.mockReturnValue({ isOnline: true })
    await rerender(<OfflineVerificationSync />)

    expect(syncMock).toHaveBeenCalledTimes(1)
  })
})
