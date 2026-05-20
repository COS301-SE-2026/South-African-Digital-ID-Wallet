export type LoginFormValues = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  userId?: number
}
