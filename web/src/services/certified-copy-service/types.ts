import type { CredentialType } from '@/services/credential-service'

export type GenerateCertifiedCopyRequest = {
  credentialType: CredentialType
}

export type CertifiedCopyDocument = {
  blob: Blob
  fileName: string
}
