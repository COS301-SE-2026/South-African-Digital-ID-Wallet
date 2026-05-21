export type LoginFormValues = {
  email: string
  password: string
}

export type LoginResponse = {
  userId: string
  role: string
  names: string
  surname: string
  token: string
  expiresAt: string
}
