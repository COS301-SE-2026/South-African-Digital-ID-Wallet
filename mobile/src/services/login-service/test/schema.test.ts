import { loginSchema } from '../schema'

describe('loginSchema', () => {
  it('Should accept a credential pair', () => {
    const result = loginSchema.safeParse({
      email: 'thabo@flashid.co.za',
      password: 'hunter2',
    })
    expect(result.success).toBe(true)
  })
  it('Should trim surrounding whitespaces from the email', () => {
    const result = loginSchema.safeParse({
      email: ' thabo@flashid.co.za ',
      password: 'hunter2',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('thabo@flashid.co.za')
    }
  })
  it('Should reject a malformed email with the user-facing message', () => {
    const result = loginSchema.safeParse({ email: 'nope', password: 'hunter2' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Enter a valid email address.'
      )
    }
  })
  it('Should reject empty password', () => {
    const result = loginSchema.safeParse({
      email: 'thabo@flashid.co.za',
      password: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Enter your password.')
    }
  })
})
