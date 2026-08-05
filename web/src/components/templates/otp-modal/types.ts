export type OtpModalProps = {
  open: boolean
  onClose: () => void
  onSuccess: (otp: string) => Promise<void>
}
