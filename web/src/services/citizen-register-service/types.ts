export type RegisterFormValues = {
  email: string
  password: string
}

export type RegisterResponse = {
  userId: string
  email: string
  createdAt: string
  message: string
}

export type VerifyEmailValues = {
  email: string
  code: string
}
