import type { CredentialResponse } from '@/services/credential-service'

export type CertifiedCopyGeneratedProps = {
  credential: CredentialResponse
  generatedAt: string
  pdfUrl: string
  fileName: string
  onBack: () => void
}
