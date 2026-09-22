import api from '@/lib/api'

import emergencyService from '../emergency-service'
import emergencyUrls from '../emergency-urls'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}))

const get = api.get as jest.Mock
const post = api.post as jest.Mock
const put = api.put as jest.Mock

describe('emergencyService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    get.mockResolvedValue({ data: 'ok' })
    post.mockResolvedValue({ data: 'ok' })
    put.mockResolvedValue({ data: 'ok' })
  })

  it('Should get the profile', async () => {
    await expect(emergencyService.getProfile()).resolves.toBe('ok')
    expect(get).toHaveBeenCalledWith(emergencyUrls.profile())
  })

  it('Should get the offline credential', async () => {
    await expect(emergencyService.getOfflineCredential()).resolves.toBe('ok')
    expect(get).toHaveBeenCalledWith(emergencyUrls.offlineCredential())
  })

  it('Should post a device registration', async () => {
    const dto = {
      deviceLabel: 'Pixel 8',
      isStrongBoxBacked: true,
      platform: 'android' as const,
      publicKeySpki: 'spki',
    }
    await emergencyService.registerDevice(dto)
    expect(post).toHaveBeenCalledWith(emergencyUrls.devices(), dto)
  })

  it('Should post a resolve request', async () => {
    const dto = { code: 'c', justification: 'j', wasOffline: false }
    await emergencyService.resolve(dto)
    expect(post).toHaveBeenCalledWith(emergencyUrls.resolve(), dto)
  })

  it('Should put the profile', async () => {
    const profile = {
      contacts: [],
      fields: {},
      isEnabled: true,
      medicalLastUpdatedAt: null,
      offlineFields: [],
    }
    await emergencyService.saveProfile(profile)
    expect(put).toHaveBeenCalledWith(emergencyUrls.profile(), profile)
  })
})
