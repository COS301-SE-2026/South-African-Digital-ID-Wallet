import { onboardingSchema, retrivalSchema } from '@/schemas/onboarding-schema'

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

describe('onboardingSchema', () => {
  const valid = {
    phone: '+27612345678',
    email: 'thabo@example.com',
    contactDetailsConsent: true as const,
    idConsent: true as const,
  }

  it.each([
    '+27612345678',
    '+27712345678',
    '+27812345678',
    '0612345678',
    '0712345678',
    '0812345678',
  ])('Should accept the SA phone number', (phone) => {
    expect(onboardingSchema.safeParse({ ...valid, phone }).success).toBe(true)
  })

  it.each([
    '0512345678',
    '+27512345678',
    '061234567',
    '06123456789',
    '+27 61 234 5678',
    '',
  ])('Should reject invalid phone number', (phone) => {
    expect(onboardingSchema.safeParse({ ...valid, phone }).success).toBe(false)
  })

  it.each(['not-an-email', 'missing@domain', '', 'spaced out@example.com'])(
    'Should reject invalid email',
    (email) => {
      expect(onboardingSchema.safeParse({ ...valid, email }).success).toBe(
        false
      )
    }
  )

  it.each(['contactDetailsConsent', 'idConsent'] as const)(
    'Should require contact info',
    (field) => {
      expect(
        onboardingSchema.safeParse({ ...valid, [field]: false }).success
      ).toBe(false)
    }
  )
})
