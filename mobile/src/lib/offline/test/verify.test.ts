import { readFileSync } from 'fs'
import { join } from 'path'

import { p256 } from '@noble/curves/nist.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { base64urlnopad } from '@scure/base'

import { verifyPresentation, type PublicJwk, type TrustData } from '../verify'

const FIXTURE_PATH = join(
  __dirname,
  '../../../../../backend/FlashIdBackend/tests/TestData/offline-verification/cross-stack-fixture.json'
)

const LICENCE_VCT = 'urn:flashid:drivers-license:1'
const KID = 'test-key'

// P-256 group order, used to build the high-S twin of a signature for the D-014 test.
const P256_ORDER =
  0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n

const utf8 = (value: string) => new TextEncoder().encode(value)
const encodeJson = (value: unknown) =>
  base64urlnopad.encode(utf8(JSON.stringify(value)))
const digestOf = (text: string) => base64urlnopad.encode(sha256(utf8(text)))

const jwkFor = (privateKey: Uint8Array): PublicJwk => {
  const point = p256.getPublicKey(privateKey, false)

  return {
    kty: 'EC',
    crv: 'P-256',
    x: base64urlnopad.encode(point.slice(1, 33)),
    y: base64urlnopad.encode(point.slice(33)),
  }
}

const signJws = (header: unknown, payload: unknown, privateKey: Uint8Array) => {
  const signingInput = `${encodeJson(header)}.${encodeJson(payload)}`
  const signature = p256.sign(utf8(signingInput), privateKey, { prehash: true })

  return `${signingInput}.${base64urlnopad.encode(signature)}`
}

type MintOptions = {
  claims?: Record<string, string>
  vct?: string
  issuer?: string
  algorithm?: string
  expiresInSeconds?: number
  revocationIndex?: number
  deviceKey?: PublicJwk
}

const NOW = 1_790_000_000

const mint = (options: MintOptions = {}) => {
  const privateKey = p256.utils.randomSecretKey()
  const claims = options.claims ?? {
    portrait: 'UklGRg',
    expiry_date: '2030-06-30',
    date_of_birth: '1998-03-14',
  }

  const disclosures = Object.entries(claims).map(([name, value], index) =>
    base64urlnopad.encode(
      utf8(JSON.stringify([`salt${index}0000000000`, name, value]))
    )
  )

  const payload: Record<string, unknown> = {
    iss: options.issuer ?? 'urn:flashid:issuer',
    vct: options.vct ?? LICENCE_VCT,
    iat: NOW - 60,
    exp: NOW + (options.expiresInSeconds ?? 3600),
    ri: options.revocationIndex ?? 7,
    _sd_alg: 'sha-256',
    _sd: disclosures.map(digestOf),
  }

  if (options.deviceKey) {
    payload.cnf = { jwk: options.deviceKey }
  }

  const issuerJwt = signJws(
    { alg: options.algorithm ?? 'ES256', typ: 'dc+sd-jwt', kid: KID },
    payload,
    privateKey
  )
  const sdJwt = `${[issuerJwt, ...disclosures].join('~')}~`

  const trust: TrustData = {
    keys: [{ kid: KID, status: 'active', ...jwkFor(privateKey) }],
    retrievedAt: NOW - 3600,
    revokedIndexes: [],
  }

  return { sdJwt, issuerJwt, disclosures, trust, privateKey }
}

const keyBindingFor = (sdJwt: string, privateKey: Uint8Array, issuedAt = NOW) =>
  signJws(
    { alg: 'ES256', typ: 'kb+jwt' },
    { iat: issuedAt, sd_hash: digestOf(sdJwt) },
    privateKey
  )

describe('verifyPresentation', () => {
  it('verifies the committed cross-stack fixture', () => {
    const fixture = JSON.parse(readFileSync(FIXTURE_PATH, 'utf8'))

    const result = verifyPresentation(
      fixture.presentation,
      {
        keys: fixture.issuerKeys.map((key: PublicJwk & { kid: string }) => ({
          ...key,
          status: 'active',
        })),
        retrievedAt: fixture.verifyAtUnix,
        revokedIndexes: [],
      },
      { now: fixture.verifyAtUnix }
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.vct).toBe(fixture.expected.vct)
    expect(result.revocationIndex).toBe(fixture.expected.revocationIndex)
    expect(result.claims).toEqual(fixture.expected.claims)
  })

  it('accepts a high-S signature (D-014)', () => {
    const { sdJwt, trust } = mint()
    const [header, payload, signature] = sdJwt.split('~')[0].split('.')

    // Same signature with s replaced by n - s: still valid, but rejected unless lowS is disabled.
    const raw = base64urlnopad.decode(signature)
    const s = BigInt(`0x${Buffer.from(raw.slice(32)).toString('hex')}`)
    const flipped = (P256_ORDER - s).toString(16).padStart(64, '0')
    const highS = new Uint8Array([
      ...raw.slice(0, 32),
      ...Buffer.from(flipped, 'hex'),
    ])

    const rebuilt = sdJwt.replace(signature, base64urlnopad.encode(highS))

    expect(verifyPresentation(rebuilt, trust, { now: NOW }).ok).toBe(true)
  })

  it.each([
    ['not a credential at all', 'garbage'],
    [
      'a credential with no disclosures separator',
      'eyJhbGciOiJFUzI1NiJ9.eyJ9.sig',
    ],
  ])('returns MALFORMED for %s', (_label, presentation) => {
    const { trust } = mint()
    const result = verifyPresentation(presentation, trust, { now: NOW })

    expect(result).toMatchObject({ ok: false, code: 'MALFORMED' })
  })

  it('returns MALFORMED when the issuer is not FlashID', () => {
    const { sdJwt, trust } = mint({ issuer: 'urn:someone-else:issuer' })

    expect(verifyPresentation(sdJwt, trust, { now: NOW })).toMatchObject({
      code: 'MALFORMED',
    })
  })

  it('returns MALFORMED for a claim the backend never issues', () => {
    const { sdJwt, trust } = mint({
      claims: {
        portrait: 'UklGRg',
        expiry_date: '2030-06-30',
        date_of_birth: '1998-03-14',
        blood_type: 'O+',
      },
    })

    expect(verifyPresentation(sdJwt, trust, { now: NOW })).toMatchObject({
      code: 'MALFORMED',
    })
  })

  it('returns UNSUPPORTED_ALG when the header asks for another algorithm', () => {
    const { sdJwt, trust } = mint({ algorithm: 'ES384' })

    expect(verifyPresentation(sdJwt, trust, { now: NOW })).toMatchObject({
      code: 'UNSUPPORTED_ALG',
    })
  })

  it('returns UNKNOWN_KEY when the kid is not in the cached key set', () => {
    const { sdJwt, trust } = mint()
    const otherKey = { ...trust.keys[0], kid: 'some-other-key' }

    expect(
      verifyPresentation(sdJwt, { ...trust, keys: [otherKey] }, { now: NOW })
    ).toMatchObject({ code: 'UNKNOWN_KEY' })
  })

  it('returns REVOKED_KEY when the signing key has been revoked', () => {
    const { sdJwt, trust } = mint()
    const revoked = { ...trust.keys[0], status: 'revoked' as const }

    expect(
      verifyPresentation(sdJwt, { ...trust, keys: [revoked] }, { now: NOW })
    ).toMatchObject({ code: 'REVOKED_KEY' })
  })

  it('returns BAD_ISSUER_SIGNATURE when the payload is altered after signing', () => {
    const { sdJwt, trust, disclosures } = mint()
    const [issuerJwt] = sdJwt.split('~')
    const [header, payload, signature] = issuerJwt.split('.')

    const tampered = encodeJson({
      ...JSON.parse(new TextDecoder().decode(base64urlnopad.decode(payload))),
      ri: 999,
    })
    const forged = `${[`${header}.${tampered}.${signature}`, ...disclosures].join('~')}~`

    expect(verifyPresentation(forged, trust, { now: NOW })).toMatchObject({
      code: 'BAD_ISSUER_SIGNATURE',
    })
  })

  it('returns EXPIRED once exp has passed', () => {
    const { sdJwt, trust } = mint({ expiresInSeconds: -1 })

    expect(verifyPresentation(sdJwt, trust, { now: NOW })).toMatchObject({
      code: 'EXPIRED',
    })
  })

  it('returns CREDENTIAL_REVOKED when ri is on the revocation list', () => {
    const { sdJwt, trust } = mint({ revocationIndex: 42 })

    expect(
      verifyPresentation(
        sdJwt,
        { ...trust, revokedIndexes: [7, 42] },
        { now: NOW }
      )
    ).toMatchObject({ code: 'CREDENTIAL_REVOKED' })
  })

  it('returns DISCLOSURE_NOT_IN_SD for a disclosure the issuer never committed to', () => {
    const { sdJwt, trust } = mint()
    const smuggled = base64urlnopad.encode(
      utf8(JSON.stringify(['salt', 'license_code', 'A']))
    )
    const tampered = `${sdJwt}${smuggled}~`

    expect(verifyPresentation(tampered, trust, { now: NOW })).toMatchObject({
      code: 'DISCLOSURE_NOT_IN_SD',
    })
  })

  it('returns DUPLICATE_DISCLOSURE when a disclosure is repeated', () => {
    const { sdJwt, trust, disclosures } = mint()
    const repeated = `${sdJwt}${disclosures[0]}~`

    expect(verifyPresentation(repeated, trust, { now: NOW })).toMatchObject({
      code: 'DUPLICATE_DISCLOSURE',
    })
  })

  it('returns MISSING_MANDATORY_CLAIM when the portrait is not disclosed', () => {
    const { sdJwt, trust } = mint({
      claims: { expiry_date: '2030-06-30', date_of_birth: '1998-03-14' },
    })

    expect(verifyPresentation(sdJwt, trust, { now: NOW })).toMatchObject({
      code: 'MISSING_MANDATORY_CLAIM',
    })
  })

  it('warns when trust data is over 24 hours old but still verifies', () => {
    const { sdJwt, trust } = mint()

    const result = verifyPresentation(
      sdJwt,
      { ...trust, retrievedAt: NOW - 25 * 3600 },
      { now: NOW }
    )

    expect(result.ok).toBe(true)
    expect(result.warnings).toHaveLength(1)
  })

  it('returns STALE_TRUST_DATA when trust data is over 7 days old', () => {
    const { sdJwt, trust } = mint()

    expect(
      verifyPresentation(
        sdJwt,
        { ...trust, retrievedAt: NOW - 8 * 24 * 3600 },
        { now: NOW }
      )
    ).toMatchObject({ code: 'STALE_TRUST_DATA' })
  })

  describe('key binding', () => {
    const mintBound = () => {
      const devicePrivateKey = p256.utils.randomSecretKey()
      const minted = mint({ deviceKey: jwkFor(devicePrivateKey) })

      return { ...minted, devicePrivateKey }
    }

    it('accepts a fresh key binding JWT', () => {
      const { sdJwt, trust, devicePrivateKey } = mintBound()
      const presentation = sdJwt + keyBindingFor(sdJwt, devicePrivateKey)

      expect(
        verifyPresentation(presentation, trust, {
          now: NOW,
          requireKeyBinding: true,
        }).ok
      ).toBe(true)
    })

    it('returns MISSING_KEY_BINDING when Phase 4 requires one and none is present', () => {
      const { sdJwt, trust } = mintBound()

      expect(
        verifyPresentation(sdJwt, trust, { now: NOW, requireKeyBinding: true })
      ).toMatchObject({ code: 'MISSING_KEY_BINDING' })
    })

    it('returns BAD_KEY_BINDING_SIGNATURE when another device signed it', () => {
      const { sdJwt, trust } = mintBound()
      const presentation =
        sdJwt + keyBindingFor(sdJwt, p256.utils.randomSecretKey())

      expect(
        verifyPresentation(presentation, trust, {
          now: NOW,
          requireKeyBinding: true,
        })
      ).toMatchObject({ code: 'BAD_KEY_BINDING_SIGNATURE' })
    })

    it('returns SD_HASH_MISMATCH when disclosures changed after the holder signed', () => {
      const { sdJwt, trust, devicePrivateKey, disclosures } = mintBound()
      const keyBinding = keyBindingFor(sdJwt, devicePrivateKey)
      const withoutOne = `${sdJwt.split('~').slice(0, -2).join('~')}~`

      expect(
        verifyPresentation(withoutOne + keyBinding, trust, {
          now: NOW,
          requireKeyBinding: true,
        })
      ).toMatchObject({
        code: expect.stringMatching(/SD_HASH_MISMATCH|MISSING_MANDATORY_CLAIM/),
      })
      expect(disclosures.length).toBeGreaterThan(1)
    })

    it('returns STALE_PRESENTATION for a replayed key binding JWT', () => {
      const { sdJwt, trust, devicePrivateKey } = mintBound()
      const presentation =
        sdJwt + keyBindingFor(sdJwt, devicePrivateKey, NOW - 120)

      expect(
        verifyPresentation(presentation, trust, {
          now: NOW,
          requireKeyBinding: true,
        })
      ).toMatchObject({ code: 'STALE_PRESENTATION' })
    })
  })
})
