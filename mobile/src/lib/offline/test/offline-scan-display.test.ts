import {
  describeVerificationFailure,
  toOfflineScanDisplay,
} from '../offline-scan-display'
import type { VerificationFailureCode } from '../verify'

const LICENCE = 'urn:flashid:drivers-license:1'
const IDENTITY = 'urn:flashid:identity-document:1'

describe('toOfflineScanDisplay', () => {
  it('Should label licence claims the way the online result does', () => {
    const display = toOfflineScanDisplay(LICENCE, {
      full_name: 'Thabo Mokoena',
      identity_number: '0000000000000',
    })

    expect(display.credentialType).toBe("Driver's License")
    expect(display.disclosedFields).toEqual({
      'Full name': 'Thabo Mokoena',
      'SA ID number': '0000000000000',
    })
  })

  it('Should label the identity document portrait as a photograph', () => {
    const display = toOfflineScanDisplay(IDENTITY, { portrait: 'AAAA' })

    expect(display.credentialType).toBe('Identity Document')
    expect(Object.keys(display.disclosedFields)).toEqual(['Photograph'])
  })

  it('Should turn a base64url portrait into a standard base64 data URI', () => {
    // Bytes 0xfb 0xff are "-_8" in base64url and "+/8=" in standard base64.
    const display = toOfflineScanDisplay(LICENCE, { portrait: '-_8' })

    expect(display.disclosedFields.Photo).toBe('data:image/webp;base64,+/8=')
  })

  it('Should fall back to the claim name and a generic type for unknown input', () => {
    const display = toOfflineScanDisplay('urn:someone-else:1', {
      shoe_size: '9',
    })

    expect(display.credentialType).toBe('Credential')
    expect(display.disclosedFields).toEqual({ shoe_size: '9' })
  })
})

describe('describeVerificationFailure', () => {
  const codes: VerificationFailureCode[] = [
    'MALFORMED',
    'UNSUPPORTED_ALG',
    'UNKNOWN_KEY',
    'REVOKED_KEY',
    'BAD_ISSUER_SIGNATURE',
    'EXPIRED',
    'CREDENTIAL_REVOKED',
    'DISCLOSURE_NOT_IN_SD',
    'DUPLICATE_DISCLOSURE',
    'MISSING_MANDATORY_CLAIM',
    'MISSING_KEY_BINDING',
    'BAD_KEY_BINDING_SIGNATURE',
    'SD_HASH_MISMATCH',
    'STALE_PRESENTATION',
    'STALE_TRUST_DATA',
  ]

  it.each(codes)('Should give %s a message', (code) => {
    expect(describeVerificationFailure(code).length).toBeGreaterThan(0)
  })

  it('Should not distinguish between failures before the signature is checked', () => {
    expect(describeVerificationFailure('UNSUPPORTED_ALG')).toBe(
      describeVerificationFailure('BAD_ISSUER_SIGNATURE')
    )
  })
})
