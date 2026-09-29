const loginUrls = {
  login: (): string => '/api/auth/login',
  logout: (): string => '/api/auth/logout',
  verifyDevice: (): string => '/api/auth/verify-device',
  forgotPassword: (): string => '/api/auth/forgot-password',
  resetPassword: (): string => '/api/auth/reset-password',
}

export default loginUrls
