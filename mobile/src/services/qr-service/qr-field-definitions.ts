import type { QrCredentialType } from './types'

export const MANDATORY_FIELDS: Record<QrCredentialType, string[]> = {
  identityDocument: ['Date of birth', 'Photograph'],
  driversLicense: ['Photo', 'Expiry date', 'Date of birth'],
}

export const OPTIONAL_FIELDS: Record<QrCredentialType, string[]> = {
  identityDocument: [
    'Identity number',
    'Full surname',
    'Full forenames',
    'Citizenship status',
    'Gender',
    'Country of birth',
    'Signature',
    'Card issue date and number',
  ],
  driversLicense: [
    'Full name',
    'SA ID number',
    'License number',
    'License code',
    'Country of issue',
    'Signature',
    'Vehicle restrictions',
    'Date of issue',
  ],
}

export const QR_LIFETIME_SECONDS = 60

export const toQrCredentialType = (
  type: string | undefined
): QrCredentialType =>
  (type ?? '').trim().toLowerCase() === 'driverslicense'
    ? 'driversLicense'
    : 'identityDocument'
