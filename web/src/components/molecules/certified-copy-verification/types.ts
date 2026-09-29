import type { VerifyCertifiedCopyDocumentResponse } from '@/services/certified-copy-service/types'

export type CertifiedCopyVerificationState = 'progress' | 'authentic' | 'failed'

export type CertifiedCopyVerificationModalProps = {
  state: CertifiedCopyVerificationState
  result: VerifyCertifiedCopyDocumentResponse | null
  currentStep: number
  onViewCredentialDetails: () => void
  onVerifyAnotherDocument: () => void
  onContactSupport: () => void
}
