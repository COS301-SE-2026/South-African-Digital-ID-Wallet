import type { VerifyCertifiedCopyDocumentResponse } from '@/services/certified-copy-service/types'

export type AuthenticResultProps = {
  result: VerifyCertifiedCopyDocumentResponse
  onVerifyAnotherDocument: () => void
}
