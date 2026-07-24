const loginUrls = {
  login: (): string => '/api/auth/login',
  getUser: (id: number): string => `/api/auth/user/${id}`,
}

export default loginUrls
