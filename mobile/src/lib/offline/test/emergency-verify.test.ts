import { readFileSync } from 'fs'
import { join } from 'path'

import { base64urlnopad } from '@scure/base'

import {
  EMERGENCY_CLAIM_LABELS,
  EMERGENCY_CLAIM_SET,
  EMERGENCY_VCT,
} from '../emergency-claims'
import { describeVerificationFailure } from '../offline-scan-display'
import { verifyPresentation, type PublicJwk, type TrustData } from '../verify'

const FIXTURES = join(
  __dirname,
  '../../../../../backend/FlashIdBackend/tests/TestData/offline-verification'
)

type Fixture = {
  verifyAtUnix: number
  issuerKeys: (PublicJwk & { kid: string })[]
  presentation: string
  expected: {
    vct: string
    revocationIndex: number
    claims: Record<string, string>
  }
}

const load = (name: string): Fixture =>
  JSON.parse(readFileSync(join(FIXTURES, name), 'utf8'))

const emergency = load('emergency-cross-stack-fixture.json')
const identity = load('cross-stack-fixture.json')

const trustFor = (
  fixture: Fixture,
  revokedIndexes: number[] = []
): TrustData => ({
  keys: fixture.issuerKeys.map((key) => ({ ...key, status: 'active' })),
  retrievedAt: fixture.verifyAtUnix,
  revokedIndexes,
  revocationRetrievedAt: fixture.verifyAtUnix,
})

const splitKeyBinding = (presentation: string) => {
  const lastTilde = presentation.lastIndexOf('~')
  return {
    sdJwt: presentation.slice(0, lastTilde + 1),
    keyBindingJwt: presentation.slice(lastTilde + 1),
  }
}

const claimNameOf = (disclosure: string): string =>
  JSON.parse(new TextDecoder().decode(base64urlnopad.decode(disclosure)))[1]

describe('emergency offline verification', () => {
  it('Should keep the emergency vct out of the shared verifier table', () => {
    expect(emergency.expected.vct).toBe(EMERGENCY_VCT)
  })

  it('Should answer the shared verifier with EMERGENCY_CODE and no claims', () => {
    const result = verifyPresentation(
      emergency.presentation,
      trustFor(emergency),
      {
        now: emergency.verifyAtUnix,
      }
    )

    expect(result).toEqual({ ok: false, code: 'EMERGENCY_CODE', warnings: [] })
    expect(result).not.toHaveProperty('claims')
  })

  it('Should tell the officer where to read an emergency code', () => {
    expect(describeVerificationFailure('EMERGENCY_CODE')).toBe(
      'This is an emergency medical code. Open Emergency scan to read it.'
    )
  })

  it('Should verify the backend-issued emergency code with the emergency claim set', () => {
    const result = verifyPresentation(
      emergency.presentation,
      trustFor(emergency),
      {
        now: emergency.verifyAtUnix,
        claimSet: EMERGENCY_CLAIM_SET,
      }
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.vct).toBe(EMERGENCY_VCT)
    expect(result.revocationIndex).toBe(emergency.expected.revocationIndex)
    expect(result.claims).toEqual(emergency.expected.claims)
  })

  it('Should only ever disclose claims the emergency table knows how to label', () => {
    Object.keys(emergency.expected.claims).forEach((claimName) =>
      expect(EMERGENCY_CLAIM_LABELS).toHaveProperty(claimName)
    )
  })

  it('Should refuse an identity code when scanning for emergencies', () => {
    const result = verifyPresentation(
      identity.presentation,
      trustFor(identity),
      {
        now: identity.verifyAtUnix,
        claimSet: EMERGENCY_CLAIM_SET,
      }
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe('MALFORMED')
  })

  it('Should fail when the mandatory emergency claim is withheld', () => {
    const { sdJwt, keyBindingJwt } = splitKeyBinding(emergency.presentation)
    const [issuerJwt, ...disclosures] = sdJwt.split('~').slice(0, -1)
    const withheld = disclosures.filter(
      (disclosure) => claimNameOf(disclosure) !== 'medical_updated_on'
    )
    expect(withheld).toHaveLength(disclosures.length - 1)

    const result = verifyPresentation(
      `${[issuerJwt, ...withheld].join('~')}~${keyBindingJwt}`,
      trustFor(emergency),
      { now: emergency.verifyAtUnix, claimSet: EMERGENCY_CLAIM_SET }
    )

    expect(result).toMatchObject({ ok: false, code: 'MISSING_MANDATORY_CLAIM' })
  })

  it('Should refuse a code whose key binding frame is missing, so a screenshot shows nothing', () => {
    const { sdJwt } = splitKeyBinding(emergency.presentation)

    const result = verifyPresentation(sdJwt, trustFor(emergency), {
      now: emergency.verifyAtUnix,
      claimSet: EMERGENCY_CLAIM_SET,
    })

    expect(result).toMatchObject({ ok: false, code: 'MISSING_KEY_BINDING' })
  })

  it('Should refuse a replayed recording once its key binding is stale', () => {
    const result = verifyPresentation(
      emergency.presentation,
      trustFor(emergency),
      {
        now: emergency.verifyAtUnix + 120,
        claimSet: EMERGENCY_CLAIM_SET,
      }
    )

    expect(result).toMatchObject({ ok: false, code: 'STALE_PRESENTATION' })
  })

  it('Should refuse an emergency code whose index was revoked', () => {
    const result = verifyPresentation(
      emergency.presentation,
      trustFor(emergency, [emergency.expected.revocationIndex]),
      { now: emergency.verifyAtUnix, claimSet: EMERGENCY_CLAIM_SET }
    )

    expect(result).toMatchObject({ ok: false, code: 'CREDENTIAL_REVOKED' })
  })

  it('Should leave identity verification unchanged for the shared verifier', () => {
    const result = verifyPresentation(
      identity.presentation,
      trustFor(identity),
      {
        now: identity.verifyAtUnix,
      }
    )

    expect(result.ok).toBe(true)
  })
})
