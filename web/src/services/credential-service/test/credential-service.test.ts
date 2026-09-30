import api from '@/lib/api'
import credentialService from '../credential-service'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}))
const mockedApi = api as unknown as {
  get: jest.Mock
  post: jest.Mock
}
describe('credentialService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('gets the current user credentials', async () => {
    const data = [
      {
        id: 'credential-1',
        type: 'IdentityDocument',
        title: 'Identity Document',
        issuedBy: 'Home Affairs',
        status: 'Active',
        issueDate: '2026-01-01',
      },
    ]
    mockedApi.get.mockResolvedValue({ data })
    const result = await credentialService.getMine()
    expect(mockedApi.get).toHaveBeenCalledWith('/api/credentials/me')
    expect(result).toEqual(data)
  })
  it('revokes a credential', async () => {
    const request = {
      newStatus: 'Revoked' as const,
      reason: 'Credential reported as compromised',
    }
    const data = {
      credentialId: 'credential-1',
      status: 'Revoked',
      updatedAt: '2026-09-29T10:00:00Z',
    }
    mockedApi.post.mockResolvedValue({ data })
    const result = await credentialService.revoke('credential-1', request)
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/api/credentials/credential-1/revoke',
      request
    )
    expect(result).toEqual(data)
  })
  it('reinstates a credential', async () => {
    const request = {
      reason: 'Investigation completed',
    }
    const data = {
      credentialId: 'credential-1',
      status: 'Active',
      updatedAt: '2026-09-29T10:00:00Z',
    }
    mockedApi.post.mockResolvedValue({ data })
    const result = await credentialService.reinstate('credential-1', request)
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/api/credentials/credential-1/reinstate',
      request
    )
    expect(result).toEqual(data)
  })
  it('searches for citizens', async () => {
    const data = {
      results: [
        {
          citizenId: 'citizen-1',
          firstName: 'Thabo',
          surname: 'Mokoena',
          idNumber: '9001015009087',
        },
      ],
      totalResults: 1,
      page: 1,
      pageSize: 10,
    }
    mockedApi.get.mockResolvedValue({ data })
    const result = await credentialService.search('Thabo Mokoena', 1, 10)
    expect(mockedApi.get).toHaveBeenCalledWith(
      '/api/credentials/search?query=Thabo%20Mokoena&page=1&pageSize=10'
    )
    expect(result).toEqual(data)
  })
  it('gets credentials for a specific citizen', async () => {
    const data = [
      {
        id: 'credential-1',
        type: 'IdentityDocument',
        title: 'Identity Document',
        issuedBy: 'Home Affairs',
        status: 'Active',
        issueDate: '2026-01-01',
      },
    ]
    mockedApi.get.mockResolvedValue({ data })
    const result = await credentialService.getCredentialsForCitizen('citizen-1')
    expect(mockedApi.get).toHaveBeenCalledWith(
      '/api/credentials/citizen/citizen-1'
    )
    expect(result).toEqual(data)
  })
  it('propagates API errors', async () => {
    mockedApi.get.mockRejectedValue(new Error('Credential request failed'))
    await expect(credentialService.getMine()).rejects.toThrow(
      'Credential request failed'
    )
  })
})
