import api from '@/lib/api'
import issueCredentialService from '../issue-credential-service'

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
describe('issueCredentialService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('gets citizen credential status and maps dates', async () => {
    const data = {
      activatedAt: '2026-09-01T08:00:00Z',
      dateOfBirth: '1990-01-01T00:00:00Z',
      email: 'citizen@example.com',
      existingCredentials: [
        {
          issueDate: '2026-08-01T10:00:00Z',
          status: 'Active',
          type: 'IdentityDocument',
        },
      ],
      names: 'Thabo',
      phoneNumber: '0820000000',
      saId: '9001015009087',
      status: 'Activated',
      surname: 'Mokoena',
    }
    mockedApi.get.mockResolvedValue({ data })
    const result = await issueCredentialService.getCitizenStatus(
      '9001015009087'
    )
    expect(mockedApi.get).toHaveBeenCalledWith(
      '/api/credentials/citizens/9001015009087/status'
    )
    expect(result).toEqual({
      ...data,
      activatedAt: '2026-09-01',
      dateOfBirth: '1990-01-01',
      existingCredentials: [
        {
          issueDate: '2026-08-01',
          status: 'Active',
          type: 'IdentityDocument',
        },
      ],
    })
  })
  it('issues an identity document credential', async () => {
    const formValues = {
      consentGiven: true,
      credentialType: 'IdentityDocument' as const,
      saId: '9001015009087',
    }
    const data = {
      id: 'credential-1',
      issueDate: '2026-09-29T10:00:00Z',
      issuedBy: 'Home Affairs',
      status: 'Active',
      title: 'South African Identity Document',
      type: 'IdentityDocument',
    }
    mockedApi.post.mockResolvedValue({ data })
    const result = await issueCredentialService.issueCredential(formValues)
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/api/credentials/issue',
      {
        consentGiven: true,
        credentialType: 'IdentityDocument',
        saId: '9001015009087',
      }
    )
    expect(result).toEqual({
      ...data,
      issueDate: '2026-09-29',
    })
  })
  it('maps a driver license expiry date', async () => {
    const formValues = {
      consentGiven: true,
      credentialType: 'DriversLicense' as const,
      saId: '9001015009087',
    }
    const data = {
      id: 'credential-2',
      issueDate: '2026-09-29T10:00:00Z',
      issuedBy: 'Licensing Department',
      status: 'Active',
      title: "Driver's Licence",
      type: 'DriversLicense',
      driversLicense: {
        expiryDate: '2031-09-29T00:00:00Z',
        licenseCode: 'EB',
        licenseNumber: 'DL-123',
        restrictions: 'None',
      },
    }
    mockedApi.post.mockResolvedValue({ data })
    const result = await issueCredentialService.issueCredential(formValues)
    expect(result.driversLicense?.expiryDate).toBe('2031-09-29')
    expect(result.issueDate).toBe('2026-09-29')
  })
  it('propagates API errors', async () => {
    mockedApi.get.mockRejectedValue(new Error('Status request failed'))
    await expect(
      issueCredentialService.getCitizenStatus('9001015009087')
    ).rejects.toThrow('Status request failed')
  })
})