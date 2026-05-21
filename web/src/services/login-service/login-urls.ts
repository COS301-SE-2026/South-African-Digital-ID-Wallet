const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5118'

const loginUrls = {
  login: (): string => `${apiUrl}/api/auth/login`,
  getUser: (id: number): string => `${apiUrl}/api/auth/user/${id}`,
}

export default loginUrls
