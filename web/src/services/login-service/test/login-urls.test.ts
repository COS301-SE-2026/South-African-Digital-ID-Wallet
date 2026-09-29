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

  it('Should expose the password reset endpoints', () => {
    expect(loginUrls.forgotPassword()).toBe('/api/auth/forgot-password')
    expect(loginUrls.resetPassword()).toBe('/api/auth/reset-password')
  })
})
