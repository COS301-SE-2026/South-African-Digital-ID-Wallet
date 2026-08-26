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
}
