import { IdCard, Car } from 'lucide-react'

import type {
  CredentialDetailRow,
  CredentialResponse,
  CredentialStatus,
  CredentialView,
} from './types'

const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

const statusIntent = (status: CredentialStatus): 'active' | 'inactive' =>
  status === 'Active' ? 'active' : 'inactive'

const statusLabel = (status: CredentialStatus): string =>
  status === 'Active' ? 'Verified' : status

export const toCredentialView = (c: CredentialResponse): CredentialView => {
  const rows: CredentialDetailRow[] = [
    { label: 'Issued by', value: c.issuedBy },
    { label: 'Issue date', value: formatDate(c.issueDate) },
  ]

  if (c.type === 'DriversLicense' && c.driversLicense) {
    rows.push(
      { label: 'License number', value: c.driversLicense.licenseNumber },
      { label: 'Code', value: c.driversLicense.licenseCode },
      { label: 'Restrictions', value: c.driversLicense.restrictions || 'None' },
      { label: 'Expiry date', value: formatDate(c.driversLicense.expiryDate) }
    )
  } else if (c.identityDocument) {
    rows.push(
      { label: 'ID number', value: c.identityDocument.idNumber },
      { label: 'Nationality', value: c.identityDocument.nationality },
      { label: 'Citizenship', value: c.identityDocument.citizenship },
      { label: 'Country of birth', value: c.identityDocument.countryOfBirth },
      { label: 'Status', value: c.identityDocument.status }
    )
  }

  return {
    id: c.id,
    title: c.title,
    issuer: c.issuedBy,
    qrCredentialType:
      c.type === 'DriversLicense' ? 'driversLicense' : 'identityDocument',
    icon: c.type === 'DriversLicense' ? Car : IdCard,
    statusLabel: statusLabel(c.status),
    statusIntent: statusIntent(c.status),
    rows,
  }
}

// ID document photo first, driver's licence as the fallback
const PHOTO_PREFERENCE: CredentialResponse['type'][] = [
  'IdentityDocument',
  'DriversLicense',
]

export const getPreferredPhotoUrl = (
  credentials: CredentialResponse[] | undefined
): string | null => {
  for (const type of PHOTO_PREFERENCE) {
    // optional chaining skips null, undefined and blank URLs in one go
    const url = credentials
      ?.find((c) => c.type === type && c.photoUrl?.trim())
      ?.photoUrl?.trim()
    if (url) return url
  }
  return null
}

// one cache entry per user, shared by the app shell and the dashboard
export const myCredentialsQueryKey = (userId: string | undefined) =>
  ['credentials', 'me', userId] as const
