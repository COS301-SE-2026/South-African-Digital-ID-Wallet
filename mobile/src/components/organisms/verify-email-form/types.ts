export type VerifyEmailFormProps = {
  email: string
  onCancel: () => void
  onResend: () => Promise<void>
  onVerify: (otp: string) => Promise<void>
  submitError?: string | null
  testID?: string
}
