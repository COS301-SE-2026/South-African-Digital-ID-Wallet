import type { CredentialResponse } from '@/services/credential-service'
export type CertifiedCredentialCardProps = {
  credential: CredentialResponse
  onGenerateCertifiedCopy: (credential: CredentialResponse) => void
}