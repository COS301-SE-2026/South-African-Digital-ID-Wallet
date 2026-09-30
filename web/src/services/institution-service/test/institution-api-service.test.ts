import api from '@/lib/api'
import institutionService from '../institution-service'

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
describe('institutionService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('registers a Home Affairs institution', async () => {
    const formData = {
      institutionName: 'Home Affairs Johannesburg',
      institutionType: 'HomeAffairs',
      verificationNumber: 'HA-001',
      adminId: 'admin-123',
    }
    const data = {
      institutionId: 'institution-1',
      name: 'Home Affairs Johannesburg',
      type: 'HomeAffairs',
      apiKey: 'api-key',
      apiKeyReference: 'reference-1',
      verificationNumber: 'HA-001',
      createdAt: '2026-09-29T10:00:00Z',
    }
    mockedApi.post.mockResolvedValue({ data })
    const result = await institutionService.register(formData)
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/api/institutions/register',
      {
        name: 'Home Affairs Johannesburg',
        type: 0,
        verificationNumber: 'HA-001',
        adminId: 'admin-123',
      }
    )
    expect(result).toEqual(data)
  })
  it('gets all institutions', async () => {
    const data = [
      {
        institutionId: 'institution-1',
        name: 'Home Affairs Johannesburg',
        type: 'HomeAffairs',
        verificationNumber: 'HA-001',
        registeredById: 'admin-123',
        createdAt: '2026-09-29T10:00:00Z',
      },
    ]
    mockedApi.get.mockResolvedValue({ data })
    const result = await institutionService.getAll()
    expect(mockedApi.get).toHaveBeenCalledWith('/api/institutions')
    expect(result).toEqual(data)
  })
  it('propagates API errors', async () => {
    mockedApi.get.mockRejectedValue(new Error('Institution request failed'))
    await expect(institutionService.getAll()).rejects.toThrow(
      'Institution request failed'
    )
  })
})