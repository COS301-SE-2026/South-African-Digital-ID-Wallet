import { toOfflineVerification } from '../offline-audit'

jest.mock('expo-crypto', () => ({ randomUUID: () => 'scan-id' }))

const VERIFIED_AT = 1_790_000_000

describe('toOfflineVerification', () => {
  it('Should record a verified scan with its revocation index', () => {
    expect(
      toOfflineVerification(
        {
          ok: true,
          vct: 'urn:flashid:drivers-license:1',
          revocationIndex: 7,
          claims: {},
          warnings: [],
        },
        VERIFIED_AT
      )
    ).toEqual({
      id: 'scan-id',
      revocationIndex: 7,
      result: 'VERIFIED',
      verifiedAt: VERIFIED_AT,
    })
  })

  it('Should record a failed scan without any revocation index', () => {
    expect(
      toOfflineVerification(
        { ok: false, code: 'BAD_ISSUER_SIGNATURE', warnings: [] },
        VERIFIED_AT
      )
    ).toEqual({
      id: 'scan-id',
      revocationIndex: null,
      result: 'BAD_ISSUER_SIGNATURE',
      verifiedAt: VERIFIED_AT,
    })
  })
})
