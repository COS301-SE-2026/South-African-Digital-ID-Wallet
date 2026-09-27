import { p256 } from '@noble/curves/nist.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { base64urlnopad } from '@scure/base'

import { createKeyBindingJwt } from '../key-binding'
import type { OfflinePackage } from '../offline-cache'
import { createOfflinePresentation } from '../offline-presentation'
import { PayloadFrameAccumulator } from '../qr-frame-accumulator'
import {
  encodeKeyBindingFrame,
  interleaveKeyBindingFrame,
  splitPayloadFrames,
} from '../qr-frames'
import { verifyPresentation, type PublicJwk, type TrustData } from '../verify'

const NOW = 1_790_000_000
const KID = 'flashid-test-key'
const TID = 'abcdef'
const LICENCE_VCT = 'urn:flashid:drivers-license:1'
const SMALL_FRAME_SIZE = 120

const utf8 = (value: string) => new TextEncoder().encode(value)
const encodeJson = (value: unknown) =>
  base64urlnopad.encode(utf8(JSON.stringify(value)))
const digestOf = (text: string) => base64urlnopad.encode(sha256(utf8(text)))

const jwkFor = (secretKey: Uint8Array): PublicJwk => {
  const point = p256.getPublicKey(secretKey, false)

  return {
    kty: 'EC',
    crv: 'P-256',
    x: base64urlnopad.encode(point.slice(1, 33)),
    y: base64urlnopad.encode(point.slice(33)),
  }
}

const signerFor = (secretKey: Uint8Array) => (message: Uint8Array) =>
  p256.sign(message, secretKey, { prehash: true, extraEntropy: false })

const mintLicencePackage = (
  claims: Record<string, string>,
  deviceKey?: PublicJwk
) => {
  const issuerKey = p256.utils.randomSecretKey()
  const disclosures = Object.fromEntries(
    Object.entries(claims).map(([name, value], index) => [
      name,
      encodeJson([`salt-${index}-000000000000`, name, value]),
    ])
  )
  const payload = {
    iss: 'urn:flashid:issuer',
    vct: LICENCE_VCT,
    iat: NOW - 60,
    exp: NOW + 3600,
    ri: 3,
    _sd_alg: 'sha-256',
    _sd: Object.values(disclosures).map(digestOf),
    ...(deviceKey ? { cnf: { jwk: deviceKey } } : {}),
  }
  const signingInput = `${encodeJson({ alg: 'ES256', typ: 'dc+sd-jwt', kid: KID })}.${encodeJson(payload)}`
  const signature = signerFor(issuerKey)(utf8(signingInput))

  const offlinePackage: OfflinePackage = {
    issuerSignedCredential: `${signingInput}.${base64urlnopad.encode(signature)}`,
    disclosures,
    signedAt: '2026-09-25T08:00:00Z',
    expiresAt: '2026-10-25T08:00:00Z',
  }
  const trust: TrustData = {
    keys: [{ kid: KID, status: 'active', ...jwkFor(issuerKey) }],
    retrievedAt: NOW - 3600,
    revokedIndexes: [],
    revocationRetrievedAt: NOW - 3600,
  }

  return { offlinePackage, trust }
}

// What the scan hook verifies: the SD-JWT from the payload frames plus the newest K frame's JWT.
const reassemble = (encodedFrames: readonly string[]) => {
  const accumulator = new PayloadFrameAccumulator()
  let snapshot = accumulator.getSnapshot()

  for (const frame of encodedFrames) {
    snapshot = accumulator.add(frame)
  }

  return snapshot.presentation === null
    ? null
    : `${snapshot.presentation}${snapshot.keyBindingJwt ?? ''}`
}

const payloadFramesOf = (presentation: string, frameSize?: number) =>
  splitPayloadFrames(presentation, TID, frameSize).map((frame) => frame.encoded)

const LICENCE_CLAIMS = {
  portrait: 'UklGRgAAAABXRUJQ',
  expiry_date: '2030-06-30',
  date_of_birth: '1998-03-14',
  full_name: 'Thabo Mokoena',
}

describe('offline flow from package to verified result', () => {
  it('Should verify a presentation built, split, scanned out of order and reassembled', () => {
    const { offlinePackage, trust } = mintLicencePackage(LICENCE_CLAIMS)
    const presentation = createOfflinePresentation(offlinePackage, [
      'Photo',
      'Expiry date',
      'Date of birth',
      'Full name',
    ])
    const frames = payloadFramesOf(presentation, SMALL_FRAME_SIZE)

    expect(frames.length).toBeGreaterThan(2)

    const scanned = reassemble([...frames].reverse())
    const result = verifyPresentation(scanned!, trust, { now: NOW })

    expect(scanned).toBe(presentation)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.vct).toBe(LICENCE_VCT)
    expect(result.claims).toEqual(LICENCE_CLAIMS)
  })

  it('Should verify when the citizen chose a field the credential has no value for', () => {
    const { offlinePackage, trust } = mintLicencePackage(LICENCE_CLAIMS)
    const presentation = createOfflinePresentation(offlinePackage, [
      'License number',
    ])

    const result = verifyPresentation(
      reassemble(payloadFramesOf(presentation))!,
      trust,
      { now: NOW }
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.claims).not.toHaveProperty('license_number')
  })

  it('Should reject a code whose frames were altered on the way to the verifier', () => {
    const { offlinePackage, trust } = mintLicencePackage(LICENCE_CLAIMS)
    const presentation = createOfflinePresentation(offlinePackage, [
      'Full name',
    ])
    const frames = payloadFramesOf(presentation, SMALL_FRAME_SIZE)
    const last = frames.length - 1
    const tampered = frames.map((frame, index) =>
      index === last
        ? frame.replace(/[A-Za-z0-9](?=[^A-Za-z0-9]*$)/, (character) =>
            character === 'A' ? 'B' : 'A'
          )
        : frame
    )

    const result = verifyPresentation(reassemble(tampered)!, trust, {
      now: NOW,
    })

    expect(result.ok).toBe(false)
  })

  it('Should reject a presentation signed by a key this verifier does not trust', () => {
    const { offlinePackage } = mintLicencePackage(LICENCE_CLAIMS)
    const { trust: otherIssuer } = mintLicencePackage(LICENCE_CLAIMS)
    const presentation = createOfflinePresentation(offlinePackage, [])

    const result = verifyPresentation(
      reassemble(payloadFramesOf(presentation))!,
      otherIssuer,
      { now: NOW }
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe('BAD_ISSUER_SIGNATURE')
  })
})

describe('offline flow for a credential bound to the citizen phone', () => {
  const phoneKey = p256.utils.randomSecretKey()

  const boundCode = (
    keyBindingSigner = signerFor(phoneKey),
    signedAt = NOW
  ) => {
    const { offlinePackage, trust } = mintLicencePackage(
      LICENCE_CLAIMS,
      jwkFor(phoneKey)
    )
    const presentation = createOfflinePresentation(offlinePackage, [
      'Full name',
    ])
    const keyBindingFrame = encodeKeyBindingFrame(
      TID,
      createKeyBindingJwt(presentation, keyBindingSigner, signedAt)
    )
    const frames = interleaveKeyBindingFrame(
      payloadFramesOf(presentation, SMALL_FRAME_SIZE),
      keyBindingFrame
    )

    return { frames, presentation, trust }
  }

  it('Should verify a bound code carrying a fresh signature from the same phone', () => {
    const { frames, trust } = boundCode()

    const result = verifyPresentation(reassemble(frames)!, trust, { now: NOW })

    expect(result.ok).toBe(true)
  })

  it('Should reject a bound code shown without its key binding frame', () => {
    const { presentation, trust } = boundCode()

    const result = verifyPresentation(
      reassemble(payloadFramesOf(presentation, SMALL_FRAME_SIZE))!,
      trust,
      { now: NOW }
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe('MISSING_KEY_BINDING')
  })

  it('Should reject a screen recording replayed two minutes later', () => {
    const { frames, trust } = boundCode(signerFor(phoneKey), NOW - 120)

    const result = verifyPresentation(reassemble(frames)!, trust, { now: NOW })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe('STALE_PRESENTATION')
  })

  it('Should reject a bound code signed by a different phone', () => {
    const { frames, trust } = boundCode(signerFor(p256.utils.randomSecretKey()))

    const result = verifyPresentation(reassemble(frames)!, trust, { now: NOW })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe('BAD_KEY_BINDING_SIGNATURE')
  })

  it('Should use the newest key binding frame when an old one was also seen', () => {
    const { frames, presentation, trust } = boundCode(
      signerFor(phoneKey),
      NOW - 120
    )
    const fresh = encodeKeyBindingFrame(
      TID,
      createKeyBindingJwt(presentation, signerFor(phoneKey), NOW)
    )

    const result = verifyPresentation(reassemble([...frames, fresh])!, trust, {
      now: NOW,
    })

    expect(result.ok).toBe(true)
  })
})
