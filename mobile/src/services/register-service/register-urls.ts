const registerUrls = {
  register: (): string => '/api/citizens/register',
  resendOtp: (): string => '/api/citizens/resend-otp',
  verifyEmail: (): string => '/api/citizens/verify-email',
}

export default registerUrls
