const base = '/api/manage-user-account'

const manageUserAccountUrls = {
  me: (): string => `${base}/me`,
  verifyPassword: (): string => `${base}/email/verify-password`,
  requestEmailChange: (): string => `${base}/email/request-change`,
  resendEmailChangeOtp: (): string => `${base}/email/resend-otp`,
  confirmEmailChange: (): string => `${base}/email/confirm`,
}

export default manageUserAccountUrls
