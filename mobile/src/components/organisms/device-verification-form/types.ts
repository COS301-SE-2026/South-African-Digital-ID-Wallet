export type DeviceVerificationFormProps = {
  email: string
  onCancel: () => void
  onVerify: (otp: string) => Promise<void>
  submitError: string | null
  testID?: string
}
