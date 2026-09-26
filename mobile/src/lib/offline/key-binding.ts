import { sha256 } from '@noble/hashes/sha2.js'
import { base64urlnopad } from '@scure/base'

import type { DeviceSigner } from './device-key'

const utf8 = (value: string) => new TextEncoder().encode(value)
const encodeJson = (value: unknown) =>
  base64urlnopad.encode(utf8(JSON.stringify(value)))

// Wire-format section 8: ES256, typ kb+jwt, and only iat and sd_hash. There is no aud or nonce,
// because a one-way QR scan gives the phone no verifier challenge to sign (section 11).
export const createKeyBindingJwt = (
  sdJwt: string,
  sign: DeviceSigner,
  issuedAt: number
): string => {
  const header = encodeJson({ alg: 'ES256', typ: 'kb+jwt' })
  // sd_hash covers the whole SD-JWT including its final tilde, so no disclosure can be added or removed.
  const payload = encodeJson({
    iat: issuedAt,
    sd_hash: base64urlnopad.encode(sha256(utf8(sdJwt))),
  })
  const signingInput = `${header}.${payload}`

  return `${signingInput}.${base64urlnopad.encode(sign(utf8(signingInput)))}`
}

// Read without verifying, only to decide whether the scanner waits for a K frame. verifyPresentation
// still enforces key binding itself, and stripping cnf would break the issuer signature anyway.
export const requiresKeyBinding = (sdJwt: string): boolean => {
  try {
    const payloadSegment = sdJwt.split('~')[0].split('.')[1] ?? ''
    const payload = JSON.parse(
      new TextDecoder().decode(base64urlnopad.decode(payloadSegment))
    )

    return typeof payload.cnf === 'object' && payload.cnf !== null
  } catch {
    return false
  }
}
