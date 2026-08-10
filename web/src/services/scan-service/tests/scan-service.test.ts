import api from '@/lib/api'
import scanService from '../scan-service'
import scanUrls from '../scan-urls'
import { beforeEach } from 'node:test'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}))

const mockedApi = api as unknown as { get: jest.Mock; post: jest.Mock }

describe('scanUrls', () => {
  it('Should build the expected endpoint', () => {
    expect(scanUrls.resolve()).toBe('/api/credentials/resolve')
    expect(scanUrls.verifyBadge()).toBe('/api/officials/verify-badge')
    expect(scanUrls.badgeToken()).toBe('/api/officials/badge-token')
  })
})

describe('scanService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should resolveCred post the token and unwrap the response', async () => {
    const data = {
      credentialType: 'IdentityDocument',
      disclosedFields: { 'Full name': 'Thabo Mokoena' },
    }
    mockedApi.post.mockResolvedValue({ data })
    const result = await scanService.resolveCred('scanned-token')
    expect(mockedApi.post).toHaveBeenCalledWith('/api/credentials/resolve', {
      token: 'scanned-token',
    })
    expect(result).toEqual(data)
  })

  it('Should show verify badge post the token and unwrap the response', async () => {
    const data = {
      institutionName: 'Home Affairs JHB',
      institutionType: 'HomeAffairs',
      mode: 'Required',
      suggestedIdentityDocumentFields: ['Full name'],
      suggestedDriversLicenseFields: [],
    }
    mockedApi.post.mockResolvedValue({ data })
    const result = await scanService.verifyBadge('badge-token')
    expect(mockedApi.post).toHaveBeenCalledWith('/api/officials/verify-badge', {
      token: 'badge-token',
    })
    expect(result).toEqual(data)
  })

  it('Should generate badge token post with no body', async () => {
    const data = { token: 'issued-token', expiresAt: '2026-08-01T10:00:00Z' }
    mockedApi.post.mockResolvedValue({ data })
    const result = await scanService.generateBadgeToken()
    expect(mockedApi.post).toHaveBeenCalledWith('/api/officials/badge-token')
    expect(result).toEqual(data)
  })

  it('Should propagates request failures', async () => {
    mockedApi.post.mockRejectedValue(new Error('network'))
    await expect(scanService.resolveCred('t')).rejects.toThrow('network')
  })
})
