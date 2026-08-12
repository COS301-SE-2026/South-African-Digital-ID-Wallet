import { retrivalSchema } from '@/schemas/onboarding-schema'

describe('retrivalSchema', () => {
  const valid = { idNumber: '9001015800086', idConsent: true as const }

  it('Should accept a 13-digit id that is valid with consent', () => {
    expect(retrivalSchema.safeParse(valid).success).toBe(true)
  })

  it('Should trim the surrounding whitespace before validating', () => {
    expect(
      retrivalSchema.safeParse({ ...valid, idNumber: '  9001015800086  ' })
        .success
    ).toBe(true)
  })

  it.each(['900101580008', '90010158000866', '90010158000a6', ''])(
    'should reject wrong id numbers',
    (idNumber) => {
      expect(retrivalSchema.safeParse({ ...valid, idNumber }).success).toBe(
        false
      )
    }
  )

  it('Should require consent', () => {
    expect(
      retrivalSchema.safeParse({ ...valid, idConsent: false }).success
    ).toBe(false)
  })

  it('Should show the config error message', () => {
    const result = retrivalSchema.safeParse({ ...valid, idNumber: '123' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('13 digit')
    }
  })
})
