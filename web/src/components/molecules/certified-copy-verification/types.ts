export type CertifiedCopyVerificationState =
  | 'progress'
  | 'authentic'
  | 'failed'

export type CertifiedCopyVerificationModalProps = {
  state: CertifiedCopyVerificationState
  currentStep: number
  onViewCredentialDetails: () => void
  onVerifyAnotherDocument: () => void
  onContactSupport: () => void
}