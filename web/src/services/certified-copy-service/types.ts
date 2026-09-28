import type { CredentialType } from '@/services/credential-service'
export type GenerateCertifiedCopyRequest = {
  credentialType: CredentialType
}
export type CertifiedCopyDocument = {
  blob: Blob
  fileName: string
}
export type VerifyCertifiedCopyResponse = {
  isValid: boolean
  status: string
  certificationId: string
  generatedAt: string
  expiresAt: string | null
  credentialType: string
  issuedBy: string
  issueDate: string
  fullName: string
  idNumber: string
  dateOfBirth: string | null
  citizenship: string | null
  countryOfBirth: string | null
  nationality: string | null
  licenseNumber: string | null
  licenseCode: string | null
  restrictions: string | null
  expiryDate: string | null
  countryOfIssue: string | null
}
export type VerifyCertifiedCopyDocumentResponse = {
  isValid: boolean
  documentIntegrityValid: boolean
  status: string
  certificationId: string
  credentialType: string
  fullName: string
  idNumber: string
  generatedAt: string
  expiresAt: string | null
  message: string
}