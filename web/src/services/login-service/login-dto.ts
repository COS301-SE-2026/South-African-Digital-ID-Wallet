import type {
  LoginFormValues,
  LoginResponse,
  VerifyDeviceRequest,
} from './types'

export const loginDto = (formData: LoginFormValues) => {
  return {
    email: formData.email,
    password: formData.password,
    rememberMe: formData.rememberMe ?? false,
  }
}

export const verifyDeviceDto = (requestData: VerifyDeviceRequest) => {
  return {
    deviceVerificationId: requestData.deviceVerificationId,
    otp: requestData.otp,
    deviceType: requestData.deviceType,
    operatingSystem: requestData.operatingSystem,
    browser: requestData.browser,
    rememberMe: requestData.rememberMe ?? false,
  }
}
