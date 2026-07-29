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
