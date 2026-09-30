import { AuthenticResult } from '../authentic-result'
import { CertifiedCopyVerificationProgress } from '../certified-copy-verification-progress'
import { IntegrityFailedResult } from '../integrity-failed-result'
import type { CertifiedCopyVerificationModalProps } from './types'

export function CertifiedCopyVerification({
  state,
  result,
  currentStep,

  onVerifyAnotherDocument,
  onContactSupport,
}: Readonly<CertifiedCopyVerificationModalProps>) {
  if (state === 'progress') {
    return <CertifiedCopyVerificationProgress currentStep={currentStep} />
  }
  if (state === 'authentic' && result) {
    return (
      <AuthenticResult
        result={result}
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
