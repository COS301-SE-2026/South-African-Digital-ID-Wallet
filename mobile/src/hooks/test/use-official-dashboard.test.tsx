import { renderHook, waitFor } from '@testing-library/react-native'

import { createQueryWrapper } from '@/test/utils/render-with-providers'
import { officialService } from '@/services/official-service'

import { useOfficerBadge, useOfficialStats } from '../use-official-dashboard'

jest.mock('@/services/official-service/official-service', () => ({
  __esModule: true,
  default: {
    generateBadgeToken: jest.fn(),
    getBadge: jest.fn(),
    getStats: jest.fn(),
    verifyBadge: jest.fn(),
  },
}))

const getBadge = officialService.getBadge as jest.Mock
const getStats = officialService.getStats as jest.Mock

const BADGE = {
  expiresAt: '2026-01-01T00:01:00Z',
  institutionName: 'Home Affairs',
  institutionType: 'Government Department',
  token: 'badge-1',
}

describe('useOfficerBadge', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should expose the fetched badge', async () => {
    getBadge.mockResolvedValue(BADGE)
    const { result } = await renderHook(() => useOfficerBadge(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.badge).toEqual(BADGE))
    expect(result.current.isError).toBe(false)
  })
  it('Should surface an error and keep the badge null', async () => {
    getBadge.mockRejectedValue(new Error('boom'))
    const { result } = await renderHook(() => useOfficerBadge(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.badge).toBeNull()
  })
})

describe('useOfficialStats', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should expose the fetched stats', async () => {
    getStats.mockResolvedValue({ isCapped: true, todayCount: 50 })
    const { result } = await renderHook(() => useOfficialStats(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.stats.todayCount).toBe(50))
    expect(result.current.stats.isCapped).toBe(true)
  })
  it('Should fall back to a zeroed stat block on failure', async () => {
    getStats.mockRejectedValue(new Error('boom'))
    const { result } = await renderHook(() => useOfficialStats(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.stats).toEqual({ isCapped: false, todayCount: 0 })
  })
})
