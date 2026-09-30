import api from '@/lib/api'
import qrService from '../qr-service'

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
describe('qrService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('generates a QR token', async () => {
    const data = {
      token: 'qr-token-123',
      expiresAt: '2026-09-29T11:00:00Z',
    }
    mockedApi.post.mockResolvedValue({ data })
    const result = await qrService.generate('credential-123', [
      'Date of birth',
      'Photograph',
    ])
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/api/credentials/credential-123/qr-token',
      {
        disclosedFields: ['Date of birth', 'Photograph'],
      }
    )
    expect(result).toEqual(data)
  })
  it('gets the current user credentials for QR generation', async () => {
    const data = [
      {
        id: 'credential-123',
        credentialType: 'IdentityDocument',
      },
    ]
    mockedApi.get.mockResolvedValue({ data })
    const result = await qrService.getMine()
    expect(mockedApi.get).toHaveBeenCalledWith('/api/credentials/mine')
    expect(result).toEqual(data)
  })
  it('propagates QR generation errors', async () => {
    mockedApi.post.mockRejectedValue(new Error('QR generation failed'))
    await expect(
      qrService.generate('credential-123', ['Photograph'])
    ).rejects.toThrow('QR generation failed')
  })
})
