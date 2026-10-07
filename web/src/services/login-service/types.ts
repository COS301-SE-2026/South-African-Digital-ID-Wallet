import { DeviceType } from '@/types'

export type LoginFormValues = {
  email: string
  password: string
  rememberMe?: boolean
}

export type LoginResponse = {
  userId: string
  role: string
  token: string
  expiresAt: string
  refreshTokenExpiresAt?: string | null
  requiresDeviceVerification: boolean
  deviceVerificationId?: string | null
}

export type VerifyDeviceRequest = {
  deviceVerificationId: string
  otp: string
  deviceType: DeviceType
  operatingSystem: string
  browser: string
  rememberMe?: boolean
}

export type ResetPasswordRequest = {
  email: string
  otp: string
  newPassword: string
  confirmPassword: string
}
