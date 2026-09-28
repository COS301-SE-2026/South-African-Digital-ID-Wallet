import { act, renderHook, waitFor } from '@testing-library/react-native'

import { createQueryWrapper } from '@/test/utils/render-with-providers'
import { auditLogService } from '@/services/audit-log-service'

import { useAuditLog } from '../use-audit-log'

jest.mock('@/services/audit-log-service/audit-log-service', () => ({
  __esModule: true,
  default: { getActions: jest.fn(), getHistory: jest.fn() },
}))

const getHistory = auditLogService.getHistory as jest.Mock
const getActions = auditLogService.getActions as jest.Mock

const itemAt = (id: string) => ({
  action: 'UserLoggedIn',
  citizenName: 'Thabo Mokoena',
  citizenSaId: '9202204720082',
  createdAt: '2026-01-01T09:30:00Z',
  details: 'Signed in',
  id,
  ipAddress: '196.25.1.1',
  outcome: 'Success',
  performedBy: 'officer@flashid.co.za',
})

const pageOf = (ids: string[], page: number, totalCount: number) => ({
  items: ids.map(itemAt),
  page,
  pageSize: 15,
  totalCount,
})

describe('useAuditLog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getActions.mockResolvedValue(['UserLoggedIn'])
    getHistory.mockResolvedValue(pageOf(['a-1'], 1, 1))
  })

  it('Should start with the default filters', async () => {
    const { result } = await renderHook(() => useAuditLog(), {
      wrapper: createQueryWrapper(),
    })
    expect(result.current.outcome).toBe('all')
    expect(result.current.action).toBeUndefined()
    expect(result.current.search).toBe('')
  })
  it('Should map the first page into entries', async () => {
    const { result } = await renderHook(() => useAuditLog(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.entries).toHaveLength(1))
    expect(result.current.entries[0].title).toBe('User logged in')
    expect(result.current.totalCount).toBe(1)
  })
  it('Should expose the available actions', async () => {
    const { result } = await renderHook(() => useAuditLog(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() =>
      expect(result.current.actions).toEqual(['UserLoggedIn'])
    )
  })
  it('Should report another page when more items remain', async () => {
    getHistory.mockResolvedValue(pageOf(['a-1'], 1, 30))
    const { result } = await renderHook(() => useAuditLog(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.hasNextPage).toBe(true))
  })
  it('Should stop paging once everything is loaded', async () => {
    const { result } = await renderHook(() => useAuditLog(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.entries).toHaveLength(1))
    expect(result.current.hasNextPage).toBe(false)
  })
  it('Should append the next page of entries', async () => {
    getHistory
      .mockResolvedValueOnce(pageOf(['a-1'], 1, 2))
      .mockResolvedValueOnce(pageOf(['a-2'], 2, 2))
    const { result } = await renderHook(() => useAuditLog(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.hasNextPage).toBe(true))
    await act(async () => {
      await result.current.fetchNextPage()
    })
    await waitFor(() => expect(result.current.entries).toHaveLength(2))
  })
  it('Should refetch with the new outcome filter', async () => {
    const { result } = await renderHook(() => useAuditLog(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.entries).toHaveLength(1))
    await act(async () => {
      result.current.setOutcome('Failed')
    })
    await waitFor(() => expect(result.current.outcome).toBe('Failed'))
    await waitFor(() =>
      expect(getHistory).toHaveBeenCalledWith(
        expect.objectContaining({ outcome: 'Failed' }),
        1
      )
    )
  })
  it('Should refetch with the new action filter', async () => {
    const { result } = await renderHook(() => useAuditLog(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.entries).toHaveLength(1))
    await act(async () => {
      result.current.setAction('CredentialShared')
    })
    await waitFor(() =>
      expect(getHistory).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CredentialShared' }),
        1
      )
    )
  })
  it('Should surface an error from the history query', async () => {
    getHistory.mockRejectedValue(new Error('boom'))
    const { result } = await renderHook(() => useAuditLog(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.entries).toEqual([])
  })
})

describe('useAuditLog search debounce', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    getActions.mockResolvedValue([])
    getHistory.mockResolvedValue(pageOf([], 1, 0))
  })
  afterEach(() => jest.useRealTimers())

  it('Should hold the search term until the debounce elapses', async () => {
    const { result } = await renderHook(() => useAuditLog(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      result.current.setSearch('jane')
    })
    expect(result.current.search).toBe('jane')
    expect(getHistory).not.toHaveBeenCalledWith(
      expect.objectContaining({ search: 'jane' }),
      1
    )
    await act(async () => {
      jest.advanceTimersByTime(300)
    })
    await waitFor(() =>
      expect(getHistory).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'jane' }),
        1
      )
    )
  })
})
