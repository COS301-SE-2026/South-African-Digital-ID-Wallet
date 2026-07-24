export type VerifyIdentityCardProps = {
  steps?: string[]
  currentStep?: number
  saId: string
  pin: string
  isSubmitting?: boolean
  errorMessage?: string
  onSaIdChange: (value: string) => void
  onPinChange: (value: string) => void
  onSubmit: () => void
  onRequestNewPin?: () => void
}
