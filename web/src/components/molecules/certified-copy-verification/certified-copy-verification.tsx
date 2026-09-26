import { AuthenticResult } from '../authentic-result'
import { CertifiedCopyVerificationProgress } from '../certified-copy-verification-progress'
import { IntegrityFailedResult } from '../integrity-failed-result'
import type { CertifiedCopyVerificationModalProps } from './types'

export function CertifiedCopyVerification({
  state,
  currentStep,
  onViewCredentialDetails,
  onVerifyAnotherDocument,
  onContactSupport,
}: Readonly<CertifiedCopyVerificationModalProps>) {
  if (state === 'progress') {
    return (
      <CertifiedCopyVerificationProgress
        currentStep={currentStep}
      />
    )
  }
  if (state === 'authentic') {
    return (
      <AuthenticResult
        onViewCredentialDetails={onViewCredentialDetails}
        onVerifyAnotherDocument={onVerifyAnotherDocument}
      />
    )
  }
  return (
    <IntegrityFailedResult
      onVerifyAnotherDocument={onVerifyAnotherDocument}
      onContactSupport={onContactSupport}
    />
  )
}