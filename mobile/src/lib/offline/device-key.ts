import { p256 } from '@noble/curves/nist.js'
import { base64, base64urlnopad } from '@scure/base'
import * as Crypto from 'expo-crypto'
import * as SecureStore from 'expo-secure-store'

import type { PublicJwk } from './verify'

const DEVICE_KEY_NAME = 'flashid.offline.device-key'
const SECRET_KEY_BYTES = 32
const COORDINATE_BYTES = 32

export type DeviceSigner = (message: Uint8Array) => Uint8Array

// Random bytes are a valid P-256 key unless they are zero or not below the curve order, about 1 in
// 2^128, so this loop runs once in practice
const createSecretKey = (): Uint8Array => {
  let secretKey = Crypto.getRandomBytes(SECRET_KEY_BYTES)

  while (!p256.utils.isValidSecretKey(secretKey)) {
    secretKey = Crypto.getRandomBytes(SECRET_KEY_BYTES)
  }

  return secretKey
}

const loadSecretKey = async (): Promise<Uint8Array | null> => {
  const stored = await SecureStore.getItemAsync(DEVICE_KEY_NAME)

  return stored ? base64.decode(stored) : null
}

const storeSecretKey = async (secretKey: Uint8Array): Promise<Uint8Array> => {
  // This device only, never in a backup: a copy restored onto another phone could present the citizen's credentials,
  // which is exactly what holder binding exists to prevent.
  await SecureStore.setItemAsync(DEVICE_KEY_NAME, base64.encode(secretKey), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  })

  return secretKey
}

let pendingSecretKey: Promise<Uint8Array> | null = null

// 2 1st time callers would otherwise create 2 keys, and a package bound to the overwritten one could never be presented.
// Callers share 1 lookup, released once it settles.
const getOrCreateSecretKey = (): Promise<Uint8Array> => {
  pendingSecretKey ??= (async () =>
    (await loadSecretKey()) ??
    (await storeSecretKey(createSecretKey())))().finally(() => {
    pendingSecretKey = null
  })

  return pendingSecretKey
}

export const getDevicePublicJwk = async (): Promise<PublicJwk> => {
  const point = p256.getPublicKey(await getOrCreateSecretKey(), false)

  // An uncompressed point is one 0x04 byte followed by x and y, 32 bytes each.
  return {
    kty: 'EC',
    crv: 'P-256',
    x: base64urlnopad.encode(point.slice(1, 1 + COORDINATE_BYTES)),
    y: base64urlnopad.encode(point.slice(1 + COORDINATE_BYTES)),
  }
}

// Loaded once per presentation, so re-signing every 5 seconds does not read SecureStore each time.
export const loadDeviceSigner = async (): Promise<DeviceSigner> => {
  const secretKey = await getOrCreateSecretKey()

  // extraEntropy false gives RFC 6979 deterministic nonces, so signing never depends on the runtime providing crypto.getRandomValues,
  // which Hermes does not guarantee.
  return (message) =>
    p256.sign(message, secretKey, { prehash: true, extraEntropy: false })
}
