import { LucideIcon } from 'lucide-react-native'

import type { IconTileTone } from '@/components/atoms'

import type { CredentialTone } from '@/theme/credential-tones'

export type IdentityDocumentDetail = {
  citizenship: string
  countryOfBirth: string
  idNumber: string
  nationality: string
  status: string
}

export type DriversLicenseDetail = {
  expiryDate: string
  licenseCode: string
  licenseNumber: string
  restrictions: string
}

export type CredentialResponse = {
  driversLicense?: DriversLicenseDetail | null
  id: string
  identityDocument?: IdentityDocumentDetail | null
  issueDate: string
  issuedBy: string
  status: string
  title: string
  type: string
}

export type CredentialField = {
  label: string
  value: string
}

export type WalletCredential = {
  fields: CredentialField[]
  id: string
  isVerified: boolean
  issuedBy: string
  issuedOn: string
  status: string
  title: string
  tone: CredentialTone
  type: string
}

export type ActivityResponse = {
  id: string
  title: string
  timestamp: string
  type: string
}

export type IdentityStatus = 'verified' | 'pending' | 'attention'

export type IdentityStatusSummary = {
  description: string
  label: string
  status: IdentityStatus
  tone: IconTileTone
  value: string
}

export type ActivityEntry = {
  description: string
  id: string
  Icon: LucideIcon
  timestamp: string
  title: string
  tone: IconTileTone
}

export type ActivityPresentation = {
  Icon: LucideIcon
  title: string
  tone: IconTileTone
}
