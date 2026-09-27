import type { CredentialResponse } from '@/services/credential-service'
export type CertifiedCredentialCardProps = {
  credential: CredentialResponse
  onViewCredential: (credential: CredentialResponse) => void
  onGenerateCertifiedCopy: (credential: CredentialResponse) => void
}