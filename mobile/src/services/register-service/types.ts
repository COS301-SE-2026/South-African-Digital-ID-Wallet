import type { RegisterFormData } from './schema'

export type RegisterFormValues = RegisterFormData

export type RegisterResponse = {
  userId: string
  email: string
  createdAt: string
  message: string
}

export type VerifyEmailRequest = {
  email: string
  otp: string
}
