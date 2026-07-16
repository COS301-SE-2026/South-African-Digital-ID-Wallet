export type VerifyIdentityCardProps = {
  saId: string
  pin: string
  isSubmitting?: boolean
  errorMessage?: string
  onSaIdChange: (value: string) => void
  onPinChange: (value: string) => void
  onSubmit: () => void
  onRequestNewPin?: () => void
}
