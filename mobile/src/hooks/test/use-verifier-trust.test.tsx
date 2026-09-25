import { act, renderHook, waitFor } from '@testing-library/react-native'
import { readOfflineCache } from '@/lib/offline/offline-cache'
import { offlineService } from '@/services/offline-service'
import { createQueryWrapper } from '@/test/utils/render-with-providers'
import { useNetworkStatus } from '../use-network-status'
import { useVerifierTrust } from '../use-verifier-trust'

jest.mock('../use-network-status', () => ({ useNetworkStatus: jest.fn() }))
jest.mock('@/lib/offline/offline-cache', () => ({
  readOfflineCache: jest.fn(),
}))
jest.mock('@/services/offline-service', () => ({
  offlineService: { refreshTrustData: jest.fn() },
}))

const networkMock = useNetworkStatus as jest.Mock
const readCacheMock = readOfflineCache as jest.Mock
const refreshTrustMock = offlineService.refreshTrustData as jest.Mock

const TRUST = {
  keys: [],
  retrievedAt: 1_790_000_000,
  revokedIndexes: [],
  revocationRetrievedAt: null,
}
const CACHE = { packages: {}, trust: TRUST, savedAt: 1 }

const renderTrustHook = () =>
  renderHook(() => useVerifierTrust(), { wrapper: createQueryWrapper() })

describe('useVerifierTrust', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    networkMock.mockReturnValue({ isOffline: false })
    refreshTrustMock.mockResolvedValue(CACHE)
    readCacheMock.mockResolvedValue(CACHE)
  })

  it('Should refresh the issuer keys when online', async () => {
    const { result } = await renderTrustHook()

    await waitFor(() => expect(result.current.trust).toEqual(TRUST))
    expect(refreshTrustMock).toHaveBeenCalled()
  })

  it('Should read the phone cache when offline', async () => {
    networkMock.mockReturnValue({ isOffline: true })

    const { result } = await renderTrustHook()

    await waitFor(() => expect(result.current.trust).toEqual(TRUST))
    expect(refreshTrustMock).not.toHaveBeenCalled()
  })

  it('Should report loading until the trust data arrives', async () => {
    let resolveTrust: (cache: typeof CACHE) => void = () => {}
    refreshTrustMock.mockReturnValue(
      new Promise((resolve) => {
        resolveTrust = resolve
      })
    )

    const { result } = await renderTrustHook()

    expect(result.current.isLoading).toBe(true)
    expect(result.current.trust).toBeNull()

    await act(async () => resolveTrust(CACHE))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.trust).toEqual(TRUST)
  })

  it('Should stop loading with no trust data when none can be found', async () => {
    refreshTrustMock.mockRejectedValue(new Error('no signal and no cache'))

    const { result } = await renderTrustHook()

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.trust).toBeNull()
  })
})
