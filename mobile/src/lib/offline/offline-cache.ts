import { gcm } from '@noble/ciphers/aes.js'
import { base64 } from '@scure/base'
import * as Crypto from 'expo-crypto'
import { File, Paths } from 'expo-file-system'
import * as SecureStore from 'expo-secure-store'

import type { TrustData } from './verify'

export type OfflinePackage = {
  issuerSignedCredential: string
  disclosures: Record<string, string>
  signedAt: string
  expiresAt: string
}

// One offline scan waiting to be uploaded to the audit log. The id becomes the audit row's id on the
// backend, so a retried upload is recognised and not recorded twice.
export type OfflineVerification = {
  id: string
  revocationIndex: number | null
  result: string
  verifiedAt: number
}

export type OfflineCache = {
  // One package per credential. A citizen holds an ID and a licence, and presenting the wrong one
  // would show a verifier a different credential from the one the citizen chose.
  packages: Readonly<Record<string, OfflinePackage>>
  trust: TrustData | null
  savedAt: number
  // Optional, so caches written before audit sync still read without a version bump.
  pendingVerifications?: readonly OfflineVerification[]
}

const CACHE_KEY_NAME = 'flashid.offline.cache-key'
const CACHE_FILE_NAME = 'flashid-offline-cache.bin'
const KEY_BYTES = 32
const NONCE_BYTES = 12

// Bumped whenever the cached shape changes, so an older file is refetched rather than misread.
const CACHE_VERSION = 1

const cacheFile = () => new File(Paths.document, CACHE_FILE_NAME)

// Best effort: failing to remove an unusable file must not turn "no cache" into a crash, and the
// next write overwrites it anyway.
const discard = (file: File) => {
  try {
    file.delete()
  } catch {
    // Nothing more to do; the caller still reports that there is no usable cache.
  }
}

const loadKey = async (): Promise<Uint8Array | null> => {
  const stored = await SecureStore.getItemAsync(CACHE_KEY_NAME)

  return stored ? base64.decode(stored) : null
}

const createKey = async (): Promise<Uint8Array> => {
  const key = Crypto.getRandomBytes(KEY_BYTES)

  // iOS: kept out of backups and off any other device. Android: the expo-secure-store config plugin
  // in app.json (configureAndroidBackup defaults to true) writes backup rules that exclude
  // SecureStore. The cache file itself is backed up, but without this key it cannot be decrypted,
  // and readOfflineCache deletes it.
  await SecureStore.setItemAsync(CACHE_KEY_NAME, base64.encode(key), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  })

  return key
}

let pendingKey: Promise<Uint8Array> | null = null

// Two writes racing on first use would each create a key, and the file written with the losing key
// could never be decrypted. Concurrent callers share one lookup, and it is released once settled,
// so no key is held in memory after use.
const getOrCreateKey = (): Promise<Uint8Array> => {
  pendingKey ??= (async () =>
    (await loadKey()) ?? (await createKey()))().finally(() => {
    pendingKey = null
  })

  return pendingKey
}

export const writeOfflineCache = async (
  contents: OfflineCache
): Promise<void> => {
  const key = await getOrCreateKey()
  const nonce = Crypto.getRandomBytes(NONCE_BYTES)
  const plaintext = new TextEncoder().encode(
    JSON.stringify({ version: CACHE_VERSION, ...contents })
  )

  // A fresh nonce per write: reusing one with the same key would leak the difference between two
  // cache versions, which is the classic GCM failure.
  const ciphertext = gcm(key, nonce).encrypt(plaintext)

  // Not atomic, deliberately: a write cut short by a crash fails GCM authentication on the next read
  // and is discarded, so the worst case is one refetch.
  const file = cacheFile()
  file.create({ overwrite: true })
  file.write(new Uint8Array([...nonce, ...ciphertext]))
}

export const readOfflineCache = async (): Promise<OfflineCache | null> => {
  const file = cacheFile()

  if (!file.exists) {
    return null
  }

  const key = await loadKey()

  // The file is useless without its key, so a missing key means a reinstall or a restored backup.
  if (!key) {
    discard(file)
    return null
  }

  try {
    const raw = await file.bytes()
    const nonce = raw.slice(0, NONCE_BYTES)
    const ciphertext = raw.slice(NONCE_BYTES)

    // GCM authenticates as it decrypts, so any edit to the file throws here rather than returning
    // altered credentials. That also means only this module can have written what follows.
    const plaintext = gcm(key, nonce).decrypt(ciphertext)
    const { version, ...contents } = JSON.parse(
      new TextDecoder().decode(plaintext)
    ) as OfflineCache & { version?: number }

    // A cache from an older build, such as the single-package shape, is dropped and refetched.
    if (version !== CACHE_VERSION) {
      discard(file)
      return null
    }

    return contents
  } catch {
    // Tampered or corrupt: drop it and fall back to online, rather than trusting half a file.
    discard(file)
    return null
  }
}

export const clearOfflineCache = async (): Promise<void> => {
  const file = cacheFile()

  if (file.exists) {
    discard(file)
  }

  await SecureStore.deleteItemAsync(CACHE_KEY_NAME)
}
