import api from '@/lib/api'

import auditLogService from '../audit-log-service'
import auditLogUrls, { AUDIT_LOG_PAGE_SIZE } from '../audit-log-urls'
import type { AuditLogQuery } from '../types'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
  setAuthToken: jest.fn(),
  setDeviceToken: jest.fn(),
}))

const getMock = api.get as jest.Mock

const baseQuery: AuditLogQuery = {
  action: undefined,
  outcome: 'all',
  search: '',
}

describe('auditLogUrls', () => {
  it('Should omit empty filters from the query string', () => {
    expect(auditLogUrls.history(baseQuery, 1)).toBe(
      `/api/officials/history?page=1&pageSize=${AUDIT_LOG_PAGE_SIZE}`
    )
  })
  it('Should drop the outcome filter when it is "all"', () => {
    expect(
      auditLogUrls.history({ ...baseQuery, outcome: 'all' }, 1)
    ).not.toContain('type=')
  })
  it('Should include a concrete outcome as the type param', () => {
    expect(auditLogUrls.history({ ...baseQuery, outcome: 'Failed' }, 2)).toBe(
      `/api/officials/history?page=2&pageSize=${AUDIT_LOG_PAGE_SIZE}&type=Failed`
    )
  })
  it('Should trim the search term and url-encode it', () => {
    expect(
      auditLogUrls.history({ ...baseQuery, search: '  jane doe  ' }, 1)
    ).toContain('search=jane%20doe')
  })
  it('Should drop a whitespace-only search term', () => {
    expect(
      auditLogUrls.history({ ...baseQuery, search: '   ' }, 1)
    ).not.toContain('search=')
  })
  it('Should include the action filter when set', () => {
    expect(
      auditLogUrls.history({ ...baseQuery, action: 'UserLoggedIn' }, 1)
    ).toContain('action=UserLoggedIn')
  })
  it('Should expose the actions endpoint', () => {
    expect(auditLogUrls.actions()).toBe('/api/officials/history/actions')
  })
})

describe('auditLogService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should GET a page of history and unwrap the data', async () => {
    const page = {
      items: [],
      page: 1,
      pageSize: AUDIT_LOG_PAGE_SIZE,
      totalCount: 0,
    }
    getMock.mockResolvedValue({ data: page })
    await expect(auditLogService.getHistory(baseQuery, 1)).resolves.toEqual(
      page
    )
    expect(getMock).toHaveBeenCalledWith(
      `/api/officials/history?page=1&pageSize=${AUDIT_LOG_PAGE_SIZE}`
    )
  })
  it('Should unwrap the nested actions array', async () => {
    getMock.mockResolvedValue({
      data: { actions: ['UserLoggedIn', 'CredentialShared'] },
    })
    await expect(auditLogService.getActions()).resolves.toEqual([
      'UserLoggedIn',
      'CredentialShared',
    ])
    expect(getMock).toHaveBeenCalledWith('/api/officials/history/actions')
  })
  it('Should propagate transport failures', async () => {
    getMock.mockRejectedValue(new Error('network down'))
    await expect(auditLogService.getHistory(baseQuery, 1)).rejects.toThrow(
      'network down'
    )
  })
})
