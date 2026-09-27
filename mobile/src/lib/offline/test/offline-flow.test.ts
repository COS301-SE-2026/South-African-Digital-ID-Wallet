import { p256 } from '@noble/curves/nist.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { base64urlnopad } from '@scure/base'

import type { OfflinePackage } from '../offline-cache'
import { createOfflinePresentation } from '../offline-presentation'
import { PayloadFrameAccumulator } from '../qr-frame-accumulator'
import { splitPayloadFrames } from '../qr-frames'
import { verifyPresentation, type TrustData } from '../verify'

const NOW = 1_790_000_000
const KID = 'flashid-test-key'
const LICENCE_VCT = 'urn:flashid:drivers-license:1'
const SMALL_FRAME_SIZE = 120

const utf8 = (value: string) => new TextEncoder().encode(value)
const encodeJson = (value: unknown) =>
  base64urlnopad.encode(utf8(JSON.stringify(value)))
const digestOf = (text: string) => base64urlnopad.encode(sha256(utf8(text)))

const mintLicencePackage = (claims: Record<string, string>) => {
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
  }
  const signingInput = `${encodeJson({ alg: 'ES256', typ: 'dc+sd-jwt', kid: KID })}.${encodeJson(payload)}`
  const signature = p256.sign(utf8(signingInput), issuerKey, {
    prehash: true,
  })
  const point = p256.getPublicKey(issuerKey, false)

  const offlinePackage: OfflinePackage = {
    issuerSignedCredential: `${signingInput}.${base64urlnopad.encode(signature)}`,
    disclosures,
    signedAt: '2026-09-25T08:00:00Z',
    expiresAt: '2026-10-25T08:00:00Z',
  }
  const trust: TrustData = {
    keys: [
      {
        kid: KID,
        status: 'active',
        kty: 'EC',
        crv: 'P-256',
        x: base64urlnopad.encode(point.slice(1, 33)),
        y: base64urlnopad.encode(point.slice(33)),
      },
    ],
    retrievedAt: NOW - 3600,
    revokedIndexes: [],
    revocationRetrievedAt: NOW - 3600,
  }

  return { offlinePackage, trust }
}

const reassemble = (encodedFrames: readonly string[]) => {
  const accumulator = new PayloadFrameAccumulator()
  let presentation: string | null = null

  for (const frame of encodedFrames) {
    presentation = accumulator.add(frame).presentation
  }

  return presentation
}

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
    const frames = splitPayloadFrames(
      presentation,
      'abcdef',
      SMALL_FRAME_SIZE
    ).map((frame) => frame.encoded)

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
      reassemble(
        splitPayloadFrames(presentation, 'abcdef').map((frame) => frame.encoded)
      )!,
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
    const frames = splitPayloadFrames(
      presentation,
      'abcdef',
      SMALL_FRAME_SIZE
    ).map((frame) => frame.encoded)
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
      reassemble(
        splitPayloadFrames(presentation, 'abcdef').map((frame) => frame.encoded)
      )!,
      otherIssuer,
      { now: NOW }
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe('BAD_ISSUER_SIGNATURE')
  })
})
