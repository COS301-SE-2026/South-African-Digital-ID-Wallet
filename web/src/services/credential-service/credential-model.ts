import { IdCard, Car, type LucideIcon } from 'lucide-react'

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
    icon: c.type === 'DriversLicense' ? Car : IdCard,
    statusLabel: statusLabel(c.status),
    statusIntent: statusIntent(c.status),
    rows,
  }
}
