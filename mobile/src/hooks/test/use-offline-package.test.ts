import { renderHook, waitFor } from '@testing-library/react-native'

import { readOfflineCache } from '@/lib/offline/offline-cache'
import { offlineService } from '@/services/offline-service'
import { createQueryWrapper } from '@/test/utils/render-with-providers'

import { useNetworkStatus } from '../use-network-status'
import { useOfflinePackage } from '../use-offline-package'

jest.mock('../use-network-status', () => ({ useNetworkStatus: jest.fn() }))
jest.mock('@/lib/offline/offline-cache', () => ({
  readOfflineCache: jest.fn(),
}))
jest.mock('@/services/offline-service', () => ({
  offlineService: { refreshOfflineCache: jest.fn() },
}))

const networkMock = useNetworkStatus as jest.Mock
const readCacheMock = readOfflineCache as jest.Mock
const refreshMock = offlineService.refreshOfflineCache as jest.Mock

const PACKAGE = {
  issuerSignedCredential: 'header.payload.signature',
  disclosures: {},
  signedAt: '2026-09-24T08:00:00Z',
  expiresAt: '2026-10-24T08:00:00Z',
}
const CACHE = { packages: { 'c-1': PACKAGE }, trust: null, savedAt: 1 }

const renderPackageHook = (credentialId: string | undefined) =>
  renderHook(() => useOfflinePackage(credentialId), {
    wrapper: createQueryWrapper(),
  })

describe('useOfflinePackage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    networkMock.mockReturnValue({ isOffline: false })
    refreshMock.mockResolvedValue(CACHE)
    readCacheMock.mockResolvedValue(CACHE)
  })

  it('Should refresh the package online and return this credential', async () => {
    const { result } = await renderPackageHook('c-1')

    await waitFor(() => expect(result.current.offlinePackage).toEqual(PACKAGE))
    expect(refreshMock).toHaveBeenCalledWith('c-1')
  })

  it('Should read the phone cache offline without calling the server', async () => {
    networkMock.mockReturnValue({ isOffline: true })

    const { result } = await renderPackageHook('c-1')

    await waitFor(() => expect(result.current.offlinePackage).toEqual(PACKAGE))
    expect(refreshMock).not.toHaveBeenCalled()
  })

  it('Should fall back to the phone cache when the online refresh fails', async () => {
    refreshMock.mockRejectedValue(new Error('captive portal'))

    const { result } = await renderPackageHook('c-1')

    await waitFor(() => expect(result.current.offlinePackage).toEqual(PACKAGE))
    expect(readCacheMock).toHaveBeenCalled()
  })

  it('Should return no package for a credential the cache does not hold', async () => {
    const { result } = await renderPackageHook('c-2')

    await waitFor(() => expect(result.current.isPreparing).toBe(false))
    expect(result.current.offlinePackage).toBeNull()
  })

  it('Should not fetch anything without a credential id', async () => {
    const { result } = await renderPackageHook(undefined)

    expect(result.current.offlinePackage).toBeNull()
    expect(refreshMock).not.toHaveBeenCalled()
    expect(readCacheMock).not.toHaveBeenCalled()
  })
})
