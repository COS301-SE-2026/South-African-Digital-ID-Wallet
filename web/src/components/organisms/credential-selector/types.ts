import type { CredentialType } from '@/services/qr-service'

export type CredentialSelectorProps = {
  onSelect: (credentialId: string, credentialType: CredentialType) => void
}
