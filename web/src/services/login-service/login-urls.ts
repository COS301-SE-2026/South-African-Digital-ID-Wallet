const loginUrls = {
  login: (): string => '/api/auth/login',
  getUser: (id: number): string => `/api/auth/user/${id}`,
  verifyDevice: (): string => '/api/auth/verify-device',
  resendVerificationOtp: (): string => '/api/auth/resend-device-verification',
}

export default loginUrls
