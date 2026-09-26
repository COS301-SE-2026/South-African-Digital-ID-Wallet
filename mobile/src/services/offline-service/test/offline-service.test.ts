import api from '@/lib/api'
import {
  readOfflineCache,
  writeOfflineCache,
  type OfflineCache,
} from '@/lib/offline/offline-cache'
import offlineService from '../offline-service'
import { base64urlnopad } from '@scure/base'
import { getDevicePublicJwk } from '@/lib/offline/device-key'

const encodeJson = (value: unknown) =>
  base64urlnopad.encode(new TextEncoder().encode(JSON.stringify(value)))

const credentialExpiringAt = (exp: number) =>
  `${encodeJson({ alg: 'ES256' })}.${encodeJson({ vct: 'urn:flashid:drivers-license:1', exp })}.signature`

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

jest.mock('@/lib/offline/device-key', () => ({
  getDevicePublicJwk: jest.fn(),
}))

const getMock = api.get as jest.Mock
const postMock = api.post as jest.Mock
const readOfflineCacheMock = readOfflineCache as jest.Mock
const writeOfflineCacheMock = writeOfflineCache as jest.Mock
const deviceKeyMock = getDevicePublicJwk as jest.Mock
const DEVICE_KEY = { kty: 'EC', crv: 'P-256', x: 'device-x', y: 'device-y' }

const packageResponse = {
  issuerSignedCredential: credentialExpiringAt(1_800_000_000),
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
  packages: {
    'credential-1': {
      issuerSignedCredential: credentialExpiringAt(1_800_000_000),
      disclosures: {
        full_name: 'old-disclosure',
      },
      signedAt: '2026-09-20T16:22:00.000Z',
      expiresAt: '2026-10-20T16:22:00.000Z',
    },
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
    revocationRetrievedAt: null,
  },
  savedAt: 1_790_000_000,
}

describe('offlineService', () => {
  const FIXED_NOW_MS = 1_790_010_000_000

  beforeEach(() => {
    jest.clearAllMocks()
    readOfflineCacheMock.mockResolvedValue(null)
    writeOfflineCacheMock.mockResolvedValue(undefined)
    deviceKeyMock.mockResolvedValue(DEVICE_KEY)
    jest.spyOn(Date, 'now').mockReturnValue(FIXED_NOW_MS)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('Should post the device public key to the offline package endpoint', async () => {
    postMock.mockResolvedValue({ data: packageResponse })

    await expect(
      offlineService.requestOfflinePackage('credential-1')
    ).resolves.toEqual(packageResponse)

    expect(postMock).toHaveBeenCalledWith(
      '/api/credentials/credential-1/offline-package',
      { deviceKey: DEVICE_KEY }
    )
  })

  it("Should not request a package when the device key can't be loaded", async () => {
    deviceKeyMock.mockRejectedValue(new Error('secure storage unavailable'))

    await expect(
      offlineService.requestOfflinePackage('credential-1')
    ).rejects.toThrow('secure storage unavailable')

    expect(postMock).not.toHaveBeenCalled()
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
        packages: { 'credential-1': packageResponse },
        trust: {
          keys: issuerKeysResponse.keys,
          retrievedAt: 1_790_010_000,
          revokedIndexes: [],
          revocationRetrievedAt: null,
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
        packages: existingCache.packages,
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
        packages: { 'credential-1': packageResponse },
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

  it('Should keep the other credential when refreshing one', async () => {
    readOfflineCacheMock.mockResolvedValue(existingCache)
    postMock.mockResolvedValue({ data: packageResponse })
    getMock.mockResolvedValue({ data: issuerKeysResponse })

    await offlineService.refreshOfflineCache('credential-2')

    expect(writeOfflineCacheMock).toHaveBeenCalledWith(
      expect.objectContaining({
        packages: {
          'credential-1': existingCache.packages['credential-1'],
          'credential-2': packageResponse,
        },
      })
    )
  })

  const axiosError = (status: number) =>
    Object.assign(new Error(`Request failed with status ${status}`), {
      isAxiosError: true,
      response: { status },
    })

  it('Should drop the package when the credential is no longer active', async () => {
    readOfflineCacheMock.mockResolvedValue(existingCache)
    postMock.mockRejectedValue(axiosError(400))
    getMock.mockResolvedValue({ data: issuerKeysResponse })

    await offlineService.refreshOfflineCache('credential-1')

    expect(writeOfflineCacheMock).toHaveBeenCalledWith(
      expect.objectContaining({ packages: {} })
    )
  })

  it('Should keep the package when the backend is only temporarily unavailable', async () => {
    readOfflineCacheMock.mockResolvedValue(existingCache)
    postMock.mockRejectedValue(axiosError(503))
    getMock.mockResolvedValue({ data: issuerKeysResponse })

    await offlineService.refreshOfflineCache('credential-1')

    expect(writeOfflineCacheMock).toHaveBeenCalledWith(
      expect.objectContaining({ packages: existingCache.packages })
    )
  })

  it('Should prune packages that have already expired', async () => {
    const expired = {
      ...existingCache.packages['credential-1'],
      issuerSignedCredential: credentialExpiringAt(1_790_000_000),
    }
    readOfflineCacheMock.mockResolvedValue({
      ...existingCache,
      packages: { 'credential-9': expired },
    })
    postMock.mockResolvedValue({ data: packageResponse })
    getMock.mockResolvedValue({ data: issuerKeysResponse })

    await offlineService.refreshOfflineCache('credential-1')

    expect(writeOfflineCacheMock).toHaveBeenCalledWith(
      expect.objectContaining({ packages: { 'credential-1': packageResponse } })
    )
  })

  it('Should keep both credentials when two refreshes run at once', async () => {
    let stored: OfflineCache | null = null
    readOfflineCacheMock.mockImplementation(async () => stored)
    writeOfflineCacheMock.mockImplementation(async (contents: OfflineCache) => {
      stored = contents
    })
    postMock.mockResolvedValue({ data: packageResponse })
    getMock.mockResolvedValue({ data: issuerKeysResponse })

    await Promise.all([
      offlineService.refreshOfflineCache('credential-1'),
      offlineService.refreshOfflineCache('credential-2'),
    ])

    expect(Object.keys(stored!.packages).sort()).toEqual([
      'credential-1',
      'credential-2',
    ])
  })

  it('Should drop an issuer key that is not EC P-256', async () => {
    getMock.mockResolvedValue({
      data: {
        ...issuerKeysResponse,
        keys: [
          ...issuerKeysResponse.keys,
          { ...issuerKeysResponse.keys[0], kid: 'rsa-key', kty: 'RSA' },
        ],
      },
    })

    const response = await offlineService.requestIssuerKeys()

    expect(response.keys.map((key) => key.kid)).toEqual([
      'flashid-cred-2026-09',
    ])
  })

  it('Should keep both causes when both refresh requests fail', async () => {
    postMock.mockRejectedValue(new Error('package request failed'))
    getMock.mockRejectedValue(new Error('issuer keys request failed'))

    await expect(
      offlineService.refreshOfflineCache('credential-1')
    ).rejects.toThrow('issuer keys request failed')
  })

  it('Should refresh only the issuer keys for a verifier', async () => {
    readOfflineCacheMock.mockResolvedValue(existingCache)
    getMock.mockResolvedValue({ data: issuerKeysResponse })

    await offlineService.refreshTrustData()

    expect(postMock).not.toHaveBeenCalled()
    expect(writeOfflineCacheMock).toHaveBeenCalledWith(
      expect.objectContaining({
        packages: existingCache.packages,
        trust: expect.objectContaining({ keys: issuerKeysResponse.keys }),
      })
    )
  })

  it('Should keep the existing cache when the verifier cannot fetch keys', async () => {
    readOfflineCacheMock.mockResolvedValue(existingCache)
    getMock.mockRejectedValue(new Error('issuer keys request failed'))

    await expect(offlineService.refreshTrustData()).resolves.toEqual(
      existingCache
    )

    expect(writeOfflineCacheMock).not.toHaveBeenCalled()
  })

  it('Should throw when the verifier cannot fetch keys and nothing is cached', async () => {
    getMock.mockRejectedValue(new Error('issuer keys request failed'))

    await expect(offlineService.refreshTrustData()).rejects.toThrow(
      'issuer keys request failed'
    )
  })
})
