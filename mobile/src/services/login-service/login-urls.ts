const loginUrls = {
  login: (): string => '/api/auth/login',
  logout: (): string => '/api/auth/logout',
  verifyDevice: (): string => '/api/auth/verify-device',
}

export default loginUrls
