import type { RegisterFormValues, VerifyEmailRequest } from './types'

export const registerDto = (formData: RegisterFormValues) => ({
  Email: formData.email.trim(),
  Password: formData.password,
})

export const verifyEmailDto = (request: VerifyEmailRequest) => ({
  Email: request.email.trim(),
  OTP: request.otp.trim(),
})

export const resendOtpDto = (email: string) => ({ Email: email.trim() })
