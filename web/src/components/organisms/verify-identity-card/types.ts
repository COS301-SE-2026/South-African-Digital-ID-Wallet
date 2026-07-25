export type VerifyIdentityCardProps = {
  readonly steps?: string[]
  readonly currentStep?: number
  readonly saId: string
  readonly pin: string
  readonly isSubmitting?: boolean
  readonly errorMessage?: string
  readonly onSaIdChange: (value: string) => void
  readonly onPinChange: (value: string) => void
  readonly onSubmit: () => void
  readonly onRequestNewPin?: () => void
}
