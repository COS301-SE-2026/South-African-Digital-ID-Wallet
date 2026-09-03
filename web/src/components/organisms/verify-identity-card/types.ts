export type VerifyIdentityCardProps = {
  readonly isOpen?: boolean
  readonly onClose?: () => void
  readonly steps?: string[]
  readonly currentStep?: number
  readonly activationCode: string
  readonly isActivationCodeDetected?: boolean
  readonly saId: string
  readonly pin: string
  readonly isSubmitting?: boolean
  readonly errorMessage?: string
  readonly submitLabel?: string
  readonly onActivationCodeChange: (value: string) => void
  readonly onSaIdChange: (value: string) => void
  readonly onPinChange: (value: string) => void
  readonly onSubmit: () => void
  readonly onRequestNewPin?: () => void
  readonly onEnterCodeManually?: () => void
}
