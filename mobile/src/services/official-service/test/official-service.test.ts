import api from '@/lib/api'

import { formatInstitutionType, toOfficerBadge } from '../official-dto'
import officialService from '../official-service'
import officialUrls from '../official-urls'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
  setAuthToken: jest.fn(),
  setDeviceToken: jest.fn(),
}))

const getMock = api.get as jest.Mock
const postMock = api.post as jest.Mock

const ISSUED = { expiresAt: '2026-01-01T00:01:00Z', token: 'badge-1' }
const VERIFIED = {
  institutionName: 'Home Affairs',
  institutionType: 'GovernmentDepartment',
  mode: 'badge',
  suggestedDriversLicenseFields: [],
  suggestedIdentityDocumentFields: [],
}

describe('officialUrls', () => {
  it('Should expose every official endpoint', () => {
    expect(officialUrls.badgeToken()).toBe('/api/officials/badge-token')
    expect(officialUrls.verifyBadge()).toBe('/api/officials/verify-badge')
    expect(officialUrls.stats()).toBe('/api/officials/stats/me')
  })
})

describe('formatInstitutionType', () => {
  it.each([
    ['GovernmentDepartment', 'Government Department'],
    ['Bank', 'Bank'],
    ['SouthAfricanPoliceService', 'South African Police Service'],
    ['', ''],
  ])('Should split %s into words', (input, expected) => {
    expect(formatInstitutionType(input)).toBe(expected)
  })
})

describe('toOfficerBadge', () => {
  it('Should merge the issued token with the verified institution', () => {
    expect(toOfficerBadge(ISSUED, VERIFIED)).toEqual({
      expiresAt: '2026-01-01T00:01:00Z',
      institutionName: 'Home Affairs',
      institutionType: 'Government Department',
      token: 'badge-1',
    })
  })
})

describe('officialService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should GET the stats endpoint and unwrap the data', async () => {
    getMock.mockResolvedValue({ data: { isCapped: false, todayCount: 4 } })
    await expect(officialService.getStats()).resolves.toEqual({
      isCapped: false,
      todayCount: 4,
    })
    expect(getMock).toHaveBeenCalledWith('/api/officials/stats/me')
  })

  it('Should POST for a badge token', async () => {
    postMock.mockResolvedValue({ data: ISSUED })
    await expect(officialService.generateBadgeToken()).resolves.toEqual(ISSUED)
    expect(postMock).toHaveBeenCalledWith('/api/officials/badge-token')
  })

  it('Should POST the token to verify a badge', async () => {
    postMock.mockResolvedValue({ data: VERIFIED })
    await expect(officialService.verifyBadge('badge-1')).resolves.toEqual(
      VERIFIED
    )
    expect(postMock).toHaveBeenCalledWith('/api/officials/verify-badge', {
      token: 'badge-1',
    })
  })

  it('Should issue then verify a badge and return the merged result', async () => {
    postMock
      .mockResolvedValueOnce({ data: ISSUED })
      .mockResolvedValueOnce({ data: VERIFIED })
    await expect(officialService.getBadge()).resolves.toEqual({
      expiresAt: '2026-01-01T00:01:00Z',
      institutionName: 'Home Affairs',
      institutionType: 'Government Department',
      token: 'badge-1',
    })
    expect(postMock).toHaveBeenNthCalledWith(1, '/api/officials/badge-token')
    expect(postMock).toHaveBeenNthCalledWith(2, '/api/officials/verify-badge', {
      token: 'badge-1',
    })
  })

  it('Should propagate a failure from the verify leg', async () => {
    postMock
      .mockResolvedValueOnce({ data: ISSUED })
      .mockRejectedValueOnce(new Error('rejected'))
    await expect(officialService.getBadge()).rejects.toThrow('rejected')
  })
})
