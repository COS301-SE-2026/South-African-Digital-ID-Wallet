export type LoginFormValues = {
  email: string
  password: string
  rememberMe?: boolean
}

export type LoginResponse = {
  userId: string
  role: string
  names: string
  surname: string
  token: string
  expiresAt: string
}
