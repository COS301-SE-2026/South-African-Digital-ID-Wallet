import { DeviceDescription } from '@/lib/device-info'
import type { SecurityAlertNotice } from '@/services/security-service'
import type { LoginFormData } from './schema'

export type LoginFormValues = LoginFormData

export type LoginResponse = {
  userId: string
  role: string
  names: string
  surname: string
  token: string
  expiresAt: string
  requiresDeviceVerification?: boolean
  deviceVerificationId?: string | null
  deviceToken?: string | null
  securityAlert?: SecurityAlertNotice | null
}

export type VerifyDeviceRequest = {
  deviceVerificationId: string
  otp: string
} & DeviceDescription
