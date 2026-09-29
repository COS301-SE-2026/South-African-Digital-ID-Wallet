const loginUrls = {
  login: (): string => '/api/auth/login',
  getUser: (id: number): string => `/api/auth/user/${id}`,
  verifyDevice: (): string => '/api/auth/verify-device',
  resendVerificationOtp: (): string => '/api/auth/resend-device-verification',
  forgotPassword: (): string => '/api/auth/forgot-password',
  resetPassword: (): string => '/api/auth/reset-password',
}

export default loginUrls
