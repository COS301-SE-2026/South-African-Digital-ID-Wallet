import type { CredentialView } from '@/services/credential-service'
export type CredentialDetailCardProps = {
  credential: CredentialView
  onGenerateCertifiedCopy: () => void
}