const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5118'

export default {
  citizenRegistration: (): string => `${apiUrl}/api/citizens/register`,
  verifyEmail: (): string => `${apiUrl}/api/citizens/verify-email`,
  resendOtp: (): string => `${apiUrl}/api/citizens/resend-otp`,
}
