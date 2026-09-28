import loginUrls from '../login-urls'

describe('loginUrls', () => {
  it('Should expose the auth endpoints', () => {
    expect(loginUrls.login()).toBe('/api/auth/login')
    expect(loginUrls.verifyDevice()).toBe('/api/auth/verify-device')
    expect(loginUrls.resendVerificationOtp()).toBe(
      '/api/auth/resend-device-verification'
    )
  })

  it('Should interpolate the user id', () => {
    expect(loginUrls.getUser(42)).toBe('/api/auth/user/42')
  })
})
