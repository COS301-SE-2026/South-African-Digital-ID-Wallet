import { act, renderHook } from '@testing-library/react-native'
import { toOfflineVerification } from '@/lib/offline/offline-audit'
import { offlineService } from '@/services/offline-service'
import { useNetworkStatus } from '../use-network-status'
import { useRecordOfflineVerification } from '../use-record-offline-verification'
import { useAuthStore } from '@/stores/auth-store'

jest.mock('../use-network-status', () => ({ useNetworkStatus: jest.fn() }))
jest.mock('@/lib/offline/offline-audit', () => ({
  toOfflineVerification: jest.fn(),
}))
jest.mock('@/services/offline-service', () => ({
  offlineService: {
    queueOfflineVerification: jest.fn(),
    syncOfflineVerifications: jest.fn(),
  },
}))

const networkMock = useNetworkStatus as jest.Mock
const queueMock = offlineService.queueOfflineVerification as jest.Mock
const syncMock = offlineService.syncOfflineVerifications as jest.Mock
const initialAuthStore = useAuthStore.getState()
const OFFICIAL = {
  userId: 'official-1',
  role: 'Official',
  names: 'Thandi',
  surname: 'Nkosi',
}

const ENTRY = {
  id: 'scan-id',
  revocationIndex: 7,
  result: 'VERIFIED',
  verifiedAt: 1,
}
const RESULT = {
  ok: true as const,
  vct: 'urn:flashid:drivers-license:1',
  revocationIndex: 7,
  claims: {},
  warnings: [],
}

const flush = () => act(async () => {})

describe('useRecordOfflineVerification', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.setState({ ...initialAuthStore, user: OFFICIAL })
    ;(toOfflineVerification as jest.Mock).mockReturnValue(ENTRY)
    queueMock.mockResolvedValue(undefined)
    syncMock.mockResolvedValue(1)
  })

  it('Should queue the scan and upload it straight away when online', async () => {
    networkMock.mockReturnValue({ isOffline: false })
    const { result } = await renderHook(() => useRecordOfflineVerification())

    result.current(RESULT)
    await flush()

    expect(queueMock).toHaveBeenCalledWith(ENTRY)
    expect(syncMock).toHaveBeenCalledWith('official-1')
  })

  it('Should only queue the scan when offline', async () => {
    networkMock.mockReturnValue({ isOffline: true })
    const { result } = await renderHook(() => useRecordOfflineVerification())

    result.current(RESULT)
    await flush()

    expect(queueMock).toHaveBeenCalledWith(ENTRY)
    expect(syncMock).not.toHaveBeenCalled()
  })

  it('Should not throw when the scan cannot be queued', async () => {
    networkMock.mockReturnValue({ isOffline: false })
    queueMock.mockRejectedValue(new Error('storage full'))
    const { result } = await renderHook(() => useRecordOfflineVerification())

    result.current(RESULT)
    await flush()

    expect(syncMock).not.toHaveBeenCalled()
  })

  it("Should not queue a citizen's scan, which the audit trail does not take", async () => {
    networkMock.mockReturnValue({ isOffline: false })
    useAuthStore.setState({ user: { ...OFFICIAL, role: 'Citizen' } })
    const { result } = await renderHook(() => useRecordOfflineVerification())

    result.current(RESULT)
    await flush()

    expect(queueMock).not.toHaveBeenCalled()
  })
})
