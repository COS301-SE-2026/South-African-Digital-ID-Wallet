export type CertifiedCopyDocument = {
  bytes: Uint8Array
  fileName: string
}

export type CertifiedCopyCredentialType = 'IdentityDocument' | 'DriversLicense'

export type GenerateCertifiedCopyRequest = {
  credentialType: CertifiedCopyCredentialType
}
