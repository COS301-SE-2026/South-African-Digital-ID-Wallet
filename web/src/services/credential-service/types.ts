import { LucideIcon } from 'lucide-react'

export type CredentialStatus =
  | 'Active'
  | 'Inactive'
  | 'Investigation'
  | 'Revoked'
  | 'Expired'

export type CredentialType = 'IdentityDocument' | 'DriversLicense'

export type IdentityDocumentDetail = {
  nationality: string
  citizenship: string
  countryOfBirth: string
  status: string
  idNumber: string
}

export type DriversLicenseDetail = {
  licenseNumber: string
  licenseCode: string
  restrictions: string
  expiryDate: string
}

export type CredentialResponse = {
  id: string
  type: CredentialType
  title: string
  issuedBy: string
  status: CredentialStatus
  issueDate: string
  identityDocument?: IdentityDocumentDetail | null
  driversLicense?: DriversLicenseDetail | null
}

export type CredentialDetailRow = {
  label: string
  value: string
}

export type CredentialView = {
  id: string
  title: string
  issuer: string
  qrCredentialType: 'identityDocument' | 'driversLicense'
  icon: LucideIcon
  statusLabel: string
  statusIntent: 'active' | 'inactive'
  rows: CredentialDetailRow[]
}
