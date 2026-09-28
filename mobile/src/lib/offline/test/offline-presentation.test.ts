import { base64urlnopad } from '@scure/base'

import type { OfflinePackage } from '../offline-cache'
import {
  createOfflinePresentation,
  isPackageUsable,
} from '../offline-presentation'

const LICENCE = 'urn:flashid:drivers-license:1'
const IDENTITY = 'urn:flashid:identity-document:1'
const NOW = 1_790_000_000

const encodeJson = (value: unknown) =>
  base64urlnopad.encode(new TextEncoder().encode(JSON.stringify(value)))

const packageFor = (
  vct: string,
  disclosures: Record<string, string>,
  exp = NOW + 3600
): OfflinePackage => ({
  issuerSignedCredential: `${encodeJson({ alg: 'ES256' })}.${encodeJson({ vct, exp })}.signature`,
  disclosures,
  signedAt: '2026-09-21T16:22:00.2243506+00:00',
  expiresAt: '2026-10-21T16:22:00.2243506+00:00',
})

const licence = packageFor(LICENCE, {
  portrait: 'd-portrait',
  expiry_date: 'd-expiry',
  date_of_birth: 'd-dob',
  full_name: 'd-name',
  signature_image: 'd-signature',
})

const disclosuresIn = (presentation: string) =>
  presentation.split('~').slice(1, -1)

describe('createOfflinePresentation', () => {
  it('always presents the mandatory claims, even with nothing selected', () => {
    expect(disclosuresIn(createOfflinePresentation(licence, []))).toEqual([
      'd-portrait',
      'd-expiry',
      'd-dob',
    ])
  })

  it('adds the optional claims the citizen selected', () => {
    expect(
      disclosuresIn(createOfflinePresentation(licence, ['Full name']))
    ).toContain('d-name')
  })

  it('skips an optional claim the backend omitted instead of failing', () => {
    const identity = packageFor(IDENTITY, {
      portrait: 'd-portrait',
      date_of_birth: 'd-dob',
    })

    expect(() =>
      createOfflinePresentation(identity, ['Card issue date and number'])
    ).not.toThrow()
  })

  it('fails when a mandatory claim is missing from the package', () => {
    const incomplete = packageFor(LICENCE, {
      expiry_date: 'd-expiry',
      date_of_birth: 'd-dob',
    })

    expect(() => createOfflinePresentation(incomplete, [])).toThrow('portrait')
  })

  it('never presents the signature image, even when selected', () => {
    expect(
      disclosuresIn(createOfflinePresentation(licence, ['Signature']))
    ).not.toContain('d-signature')
  })

  it('starts with the issuer JWT and ends with a tilde', () => {
    const presentation = createOfflinePresentation(licence, [])

    expect(presentation.startsWith(licence.issuerSignedCredential)).toBe(true)
    expect(presentation.endsWith('~')).toBe(true)
  })

  it('rejects a field label it does not know', () => {
    expect(() => createOfflinePresentation(licence, ['Blood type'])).toThrow(
      'Unsupported offline claim'
    )
  })

  it('Should refuse a label that belongs to the other credential type', () => {
    expect(() => createOfflinePresentation(licence, ['Photograph'])).toThrow(
      'Unsupported offline claim'
    )
  })
})

describe('isPackageUsable', () => {
  it('is true before the signed expiry', () => {
    expect(isPackageUsable(licence, NOW)).toBe(true)
  })

  it('is false once the signed expiry has passed', () => {
    expect(isPackageUsable(packageFor(LICENCE, {}, NOW - 1), NOW)).toBe(false)
  })

  it('is false for a credential it cannot read', () => {
    expect(
      isPackageUsable({ ...licence, issuerSignedCredential: 'not-a-jwt' }, NOW)
    ).toBe(false)
  })
})
