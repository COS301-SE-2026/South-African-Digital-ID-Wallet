export type UpdateEmailModalProps = {
  open: boolean
  onCloseAction: () => void
}

export type Step = 'password' | 'email' | 'otp'
