export interface VerificationSuccessProps {
  isOpen: boolean
  onClose: () => void
  onContinue: () => void
  fullName: string
  maskedId: string
  verifiedAt: string
  verificationMethod: string
}
