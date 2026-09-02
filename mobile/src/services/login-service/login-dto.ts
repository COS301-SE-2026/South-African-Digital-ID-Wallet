import type { LoginFormValues, VerifyDeviceRequest } from './types'

export const loginDto = (formData: LoginFormValues) => ({
  email: formData.email.trim(),
  password: formData.password,
  rememberMe: true,
})

export const verifyDeviceDto = (request: VerifyDeviceRequest) => ({
  deviceVerificationId: request.deviceVerificationId,
  otp: request.otp.trim(),
  deviceType: request.deviceType,
  operatingSystem: request.operatingSystem,
  browser: request.browser,
  deviceName: request.deviceName,
  rememberMe: true,
})
