const profileUrls = {
  account: (): string => '/api/manage-user-account/me',
  device: (deviceId: string): string => `/api/trusted-devices/${deviceId}`,
  devices: (): string => '/api/trusted-devices/me',
  notifications: (): string => '/api/notifications/me',
  password: (): string => '/api/updatepassword',
  profile: (): string => '/api/auth/me',
  emailConfirm: (): string => '/api/manage-user-account/email/confirm',
  emailRequestChange: (): string =>
    '/api/manage-user-account/email/request-change',
  emailResendOtp: (): string => '/api/manage-user-account/email/resend-otp',
  emailVerifyPassword: (): string =>
    '/api/manage-user-account/email/verify-password',
}

export default profileUrls
