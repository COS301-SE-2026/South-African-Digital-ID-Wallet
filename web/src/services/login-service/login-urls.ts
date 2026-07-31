const loginUrls = {
  login: (): string => '/api/auth/login',
  getUser: (id: number): string => `/api/auth/user/${id}`,
  verifyDevice: (): string => '/api/auth/verify-device',
}

export default loginUrls
