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

export const verifyDeviceDto = (
  requestData: VerifyDeviceRequest,
  formData: LoginFormValues
) => {
  return {
    deviceVerificationId: requestData.deviceVerificationId,
    Otp: requestData.otp,
    DeviceType: requestData.deviceType,
    OperatingSystem: requestData.operatingSystem,
    Browser: requestData.browser,
    RememberMe: formData.rememberMe ?? false,
  }
}
