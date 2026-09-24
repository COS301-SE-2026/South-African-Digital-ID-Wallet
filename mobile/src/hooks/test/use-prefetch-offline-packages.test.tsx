import { renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient } from '@tanstack/react-query'
import { offlineService } from '@/services/offline-service'
import {
  createQueryWrapper,
  createTestQueryClient,
} from '@/test/utils/render-with-providers'
import { useNetworkStatus } from '../use-network-status'
import { offlinePackageKey } from '../use-offline-package'
import { usePrefetchOfflinePackages } from '../use-prefetch-offline-packages'

jest.mock('../use-network-status', () => ({ useNetworkStatus: jest.fn() }))
jest.mock('@/services/offline-service', () => ({
  offlineService: { refreshOfflineCache: jest.fn() },
}))

const networkMock = useNetworkStatus as jest.Mock
const refreshMock = offlineService.refreshOfflineCache as jest.Mock

const CACHE = { packages: {}, trust: null, savedAt: 1_790_000_000 }

describe('usePrefetchOfflinePackages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    networkMock.mockReturnValue({ isOffline: false, isOnline: true })
    refreshMock.mockResolvedValue(CACHE)
  })

  it('Should refresh the offline package for every credential when online', async () => {
    await renderHook(() => usePrefetchOfflinePackages(['c-1', 'c-2']), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(refreshMock).toHaveBeenCalledTimes(2))
    expect(refreshMock).toHaveBeenCalledWith('c-1')
    expect(refreshMock).toHaveBeenCalledWith('c-2')
  })

  it('Should store each result under the key the share page reads', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    await renderHook(() => usePrefetchOfflinePackages(['c-1']), {
      wrapper: createQueryWrapper(queryClient),
    })

    await waitFor(() =>
      expect(queryClient.getQueryData(offlinePackageKey('c-1', false))).toEqual(
        CACHE
      )
    )
  })

  it('Should not download anything when offline', async () => {
    networkMock.mockReturnValue({ isOffline: true, isOnline: false })

    await renderHook(() => usePrefetchOfflinePackages(['c-1']), {
      wrapper: createQueryWrapper(),
    })

    expect(refreshMock).not.toHaveBeenCalled()
  })

  it('Should not download anything when there are no credentials', async () => {
    await renderHook(() => usePrefetchOfflinePackages([]), {
      wrapper: createQueryWrapper(),
    })

    expect(refreshMock).not.toHaveBeenCalled()
  })

  it('Should not download again when rerendered with the same ids in a new array', async () => {
    const { rerender } = await renderHook(
      ({ ids }: { ids: string[] }) => usePrefetchOfflinePackages(ids),
      {
        initialProps: { ids: ['c-1'] },
        wrapper: createQueryWrapper(createTestQueryClient()),
      }
    )
    await waitFor(() => expect(refreshMock).toHaveBeenCalledTimes(1))

    await rerender({ ids: ['c-1'] })

    expect(refreshMock).toHaveBeenCalledTimes(1)
  })
})
