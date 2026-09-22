import {
  clearOfflineCache,
  readOfflineCache,
  writeOfflineCache,
  type OfflineCache,
} from '../offline-cache'

const mockSecureStore = new Map<string, string>()
let mockDiskFile: Uint8Array | null = null

jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'whenUnlockedThisDeviceOnly',
  getItemAsync: jest.fn(
    async (key: string) => mockSecureStore.get(key) ?? null
  ),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockSecureStore.set(key, value)
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockSecureStore.delete(key)
  }),
}))

jest.mock('expo-crypto', () => ({
  getRandomBytes: (length: number) =>
    Uint8Array.from({ length }, (_, index) => (index * 7 + 11) % 251),
}))

jest.mock('expo-file-system', () => ({
  Paths: { document: '/ documents' },
  File: class {
    get exists() {
      return mockDiskFile !== null
    }
    create() {}
    write(bytes: Uint8Array) {
      mockDiskFile = bytes
    }
    bytes() {
      return mockDiskFile!
    }
    delete() {
      mockDiskFile = null
    }
  },
}))

const contents: OfflineCache = {
  package: {
    issuerSignedCredential: 'eyJhbGciOiJFUzI1NiJ9.eyJ9.sig',
    disclosures: {
      full_name: 'WyJzYWx0IiwiZnVsbF9uYW1lIiwiVGhhYm8gTW9rb2VuYSJd',
    },
    signedAt: '2026-09-21T16:22:00+00:00',
    expiresAt: '2026-10-21T16:22:00+00:00',
  },
  trust: { keys: [], retrievedAt: 1_790_000_000, revokedIndexes: [] },
  savedAt: 1_790_000_000,
}

describe('offline cache', () => {
  beforeEach(() => {
    mockSecureStore.clear()
    mockDiskFile = null
  })

  it('returns null when nothing has been cached', async () => {
    expect(await readOfflineCache()).toBeNull()
  })

  it('round trips a cached package', async () => {
    await writeOfflineCache(contents)

    expect(await readOfflineCache()).toEqual(contents)
  })

  it('never writes the credential in plaintext', async () => {
    await writeOfflineCache(contents)

    const onDisk = new TextDecoder().decode(mockDiskFile!)

    expect(onDisk).not.toContain('issuerSignedCredential')
    expect(onDisk).not.toContain('eyJhbGciOiJFUzI1NiJ9')
  })

  it('discards the cache when the file has been tampered with', async () => {
    await writeOfflineCache(contents)
    mockDiskFile![20] ^= 0x01

    expect(await readOfflineCache()).toBeNull()
    expect(mockDiskFile).toBeNull()
  })

  it('discards the cache when the key is gone, as after a restore onto another device', async () => {
    await writeOfflineCache(contents)
    mockSecureStore.clear()

    expect(await readOfflineCache()).toBeNull()
    expect(mockDiskFile).toBeNull()
  })

  it('clears both the file and the key', async () => {
    await writeOfflineCache(contents)

    await clearOfflineCache()

    expect(mockDiskFile).toBeNull()
    expect(mockSecureStore.size).toBe(0)
  })
})
