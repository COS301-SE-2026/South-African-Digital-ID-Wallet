export interface VerificationRequiredProps {
  isOpen: boolean
  onClose: () => void
  onVerifyIdentity: () => void
  onLearnMore?: () => void
}
