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
export type CredentialCitizen = {
  fullName: string
  idNumber: string
  dateOfBirth: string
  email?: string | null
  phone?: string | null
}
export type CredentialActivity = {
  verifications: number
  lastVerifiedAt?: string | null
  devicesUsed: number
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
  citizen?: CredentialCitizen | null
  activity?: CredentialActivity | null
}

export type RevokeCredentialRequest = {
  newStatus: CredentialStatus
  reason: string
}

export type RevokeCredentialResponse = {
  credentialId: string
  status: CredentialStatus
  updatedAt: string
}

export type ReinstateCredentialRequest = {
  reason: string
}

export type ReinstateCredentialResponse = {
  credentialId: string
  status: CredentialStatus
  updatedAt: string
}
export type CitizenSearchResult = {
  citizenId: string
  firstName: string
  surname: string
  idNumber: string
  dateJoined?: string | null
  expiresOn?: string | null
}
export type SearchCitizensResponse = {
  results: CitizenSearchResult[]
  totalResults: number
  page: number
  pageSize: number
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
