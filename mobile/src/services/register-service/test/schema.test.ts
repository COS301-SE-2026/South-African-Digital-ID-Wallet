import { checkPassword } from '../password-rules'
import { registerSchema } from '../schema'
import { registerDto } from '../register-dto'

const valid = {
  email: 'thabo@flashid.co.za',
  password: 'Str0ng!Pass1',
  confirmPassword: 'Str0ng!Pass1',
}

describe('checkPassword', () => {
  it('Should mark every rule met for a strong password', () => {
    expect(checkPassword('Str0ng!Pass1').every((rule) => rule.met)).toBe(true)
  })

  it('Should flag the rules a weak password misses', () => {
    const unmet = checkPassword('short')
      .filter((r) => !r.met)
      .map((r) => r.label)
    expect(unmet).toContain('At least 10 characters')
    expect(unmet).toContain('One uppercase letter (A-Z)')
    expect(unmet).toContain('One digit (0-9)')
  })
})

describe('registerSchema', () => {
  it('Should accept a well-formed registration', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it('Should reject a mismatched confirmation on the confirmPassword path', () => {
    const result = registerSchema.safeParse({
      ...valid,
      confirmPassword: 'Different1!',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['confirmPassword'])
    expect(result.error?.issues[0].message).toBe('Passwords do not match.')
  })

  it('Should surface the first unmet password rule as the message', () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('At least 10 characters')
  })
})

describe('registerDto', () => {
  it('Should trim the email and pascal-case the wire keys', () => {
    expect(
      registerDto({
        email: '  thabo@flashid.co.za ',
        password: 'Str0ng!Pass1',
        confirmPassword: 'Str0ng!Pass1',
      })
    ).toEqual({ Email: 'thabo@flashid.co.za', Password: 'Str0ng!Pass1' })
  })
})
