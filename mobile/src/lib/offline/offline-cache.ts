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

export type OfflineCache = {
  // One package per credential. A citizen holds an ID and a license, and presenting the wrong one would show a verifier a different credential from the one the citizen chose
  packages: Readonly<Record<string, OfflinePackage>>
  trust: TrustData | null
  savedAt: number
}

// Bumped whenever the cached shape changes, so an older file is refetched rather than misread
const CACHE_VERSION = 1
const CACHE_KEY_NAME = 'flashid.offline.cache-key'
const CACHE_FILE_NAME = 'flashid-offline-cache.bin'
const KEY_BYTES = 32
const NONCE_BYTES = 12

const cacheFile = () => new File(Paths.document, CACHE_FILE_NAME)

const loadKey = async (): Promise<Uint8Array | null> => {
  const stored = await SecureStore.getItemAsync(CACHE_KEY_NAME)

  return stored ? base64.decode(stored) : null
}

const createKey = async (): Promise<Uint8Array> => {
  const key = Crypto.getRandomBytes(KEY_BYTES)

  await SecureStore.setItemAsync(CACHE_KEY_NAME, base64.encode(key), {
    // Keeps the key off device backups and out of a restore onto another phone, so a copied cache
    // file is undecryptable even if the backup is compromised.
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  })

  return key
}

export const writeOfflineCache = async (
  contents: OfflineCache
): Promise<void> => {
  const key = (await loadKey()) ?? (await createKey())
  const nonce = Crypto.getRandomBytes(NONCE_BYTES)
  const plaintext = new TextEncoder().encode(
    JSON.stringify({ version: CACHE_VERSION, ...contents })
  )

  // A fresh nonce per write: reusing one with the same key would leak the difference between two
  // cache versions, which is the classic GCM failure.
  const ciphertext = gcm(key, nonce).encrypt(plaintext)

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
    file.delete()
    return null
  }

  try {
    const raw = await file.bytes()
    const nonce = raw.slice(0, NONCE_BYTES)
    const ciphertext = raw.slice(NONCE_BYTES)

    // GCM authenticates as it decrypts, so any edit to the file throws here rather than returning altered credentials.
    const plaintext = gcm(key, nonce).decrypt(ciphertext)
    const { version, ...contents } = JSON.parse(
      new TextDecoder().decode(plaintext)
    ) as OfflineCache & { version?: number }

    // A cache from an older build, such as the single-package shape, is dropped and refetched.
    if (version !== CACHE_VERSION) {
      file.delete()
      return null
    }

    return contents
  } catch {
    // Tampered or corrupt: drop it and fall back to online, rather than trusting half a file.
    file.delete()
    return null
  }
}

export const clearOfflineCache = async (): Promise<void> => {
  const file = cacheFile()

  if (file.exists) {
    file.delete()
  }

  await SecureStore.deleteItemAsync(CACHE_KEY_NAME)
}
