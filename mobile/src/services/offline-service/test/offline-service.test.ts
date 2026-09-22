import api from '@/lib/api'
import {
  readOfflineCache,
  writeOfflineCache,
  type OfflineCache,
} from '@/lib/offline/offline-cache'

import offlineService from '../offline-service'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
  setAuthToken: jest.fn(),
  setDeviceToken: jest.fn(),
}))

jest.mock('@/lib/offline/offline-cache', () => ({
  readOfflineCache: jest.fn(),
  writeOfflineCache: jest.fn(),
}))

const getMock = api.get as jest.Mock
const postMock = api.post as jest.Mock
const readOfflineCacheMock = readOfflineCache as jest.Mock
const writeOfflineCacheMock = writeOfflineCache as jest.Mock

const packageResponse = {
  issuerSignedCredential: 'issuer.jwt.signature',
  disclosures: {
    full_name: 'disclosure-value',
  },
  signedAt: '2026-09-21T16:22:00.000Z',
  expiresAt: '2026-10-21T16:22:00.000Z',
}

const issuerKeysResponse = {
  keys: [
    {
      kid: 'flashid-cred-2026-09',
      kty: 'EC',
      crv: 'P-256',
      x: 'x-coordinate',
      y: 'y-coordinate',
      status: 'active' as const,
    },
  ],
  retrievedAt: '2026-09-21T16:20:51.000Z',
}

const existingCache: OfflineCache = {
  package: {
    issuerSignedCredential: 'old.issuer.jwt',
    disclosures: {
      full_name: 'old-disclosure',
    },
    signedAt: '2026-09-20T16:22:00.000Z',
    expiresAt: '2026-10-20T16:22:00.000Z',
  },
  trust: {
    keys: [
      {
        kid: 'old-key',
        kty: 'EC',
        crv: 'P-256',
        x: 'old-x',
        y: 'old-y',
        status: 'retired',
      },
    ],
    retrievedAt: 1_790_000_000,
    revokedIndexes: [4, 8],
  },
  savedAt: 1_790_000_000,
}

describe('offlineService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    readOfflineCacheMock.mockResolvedValue(null)
    writeOfflineCacheMock.mockResolvedValue(undefined)
  })

  it('Should post the credential id to the offline package endpoint', async () => {
    postMock.mockResolvedValue({ data: packageResponse })

    await expect(
      offlineService.requestOfflinePackage('credential-1')
    ).resolves.toEqual(packageResponse)

    expect(postMock).toHaveBeenCalledWith(
      '/api/credentials/credential-1/offline-package'
    )
  })

  it('Should get issuer keys from the issuer keys endpoint', async () => {
    getMock.mockResolvedValue({ data: issuerKeysResponse })

    await expect(offlineService.requestIssuerKeys()).resolves.toEqual(
      issuerKeysResponse
    )

    expect(getMock).toHaveBeenCalledWith('/api/credentials/issuer-keys')
  })

  it('Should save the package and trust data after an online refresh', async () => {
    postMock.mockResolvedValue({ data: packageResponse })
    getMock.mockResolvedValue({ data: issuerKeysResponse })

    await offlineService.refreshOfflineCache('credential-1')

    expect(writeOfflineCacheMock).toHaveBeenCalledWith(
      expect.objectContaining({
        package: packageResponse,
        trust: {
          keys: issuerKeysResponse.keys,
          retrievedAt: 1_790_007_651,
          revokedIndexes: [],
        },
      })
    )
  })

  it('Should preserve the existing package when package refresh fails', async () => {
    readOfflineCacheMock.mockResolvedValue(existingCache)
    postMock.mockRejectedValue(new Error('package request failed'))
    getMock.mockResolvedValue({ data: issuerKeysResponse })

    await offlineService.refreshOfflineCache('credential-1')

    expect(writeOfflineCacheMock).toHaveBeenCalledWith(
      expect.objectContaining({
        package: existingCache.package,
        trust: expect.objectContaining({
          keys: issuerKeysResponse.keys,
        }),
      })
    )
  })

  it('Should preserve the existing trust data when issuer key refresh fails', async () => {
    readOfflineCacheMock.mockResolvedValue(existingCache)
    postMock.mockResolvedValue({ data: packageResponse })
    getMock.mockRejectedValue(new Error('issuer keys request failed'))

    await offlineService.refreshOfflineCache('credential-1')

    expect(writeOfflineCacheMock).toHaveBeenCalledWith(
      expect.objectContaining({
        package: packageResponse,
        trust: existingCache.trust,
      })
    )
  })

  it('Should return the existing cache when both refresh requests fail', async () => {
    readOfflineCacheMock.mockResolvedValue(existingCache)
    postMock.mockRejectedValue(new Error('package request failed'))
    getMock.mockRejectedValue(new Error('issuer keys request failed'))

    await expect(
      offlineService.refreshOfflineCache('credential-1')
    ).resolves.toEqual(existingCache)

    expect(writeOfflineCacheMock).not.toHaveBeenCalled()
  })

  it('Should throw when both refresh requests fail and no cache exists', async () => {
    postMock.mockRejectedValue(new Error('package request failed'))
    getMock.mockRejectedValue(new Error('issuer keys request failed'))

    await expect(
      offlineService.refreshOfflineCache('credential-1')
    ).rejects.toThrow('package request failed')

    expect(writeOfflineCacheMock).not.toHaveBeenCalled()
  })
})
