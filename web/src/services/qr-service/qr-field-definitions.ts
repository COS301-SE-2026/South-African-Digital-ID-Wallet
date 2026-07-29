export type CredentialType = 'identityDocument' | 'driversLicense'

export const MANDATORY_FIELDS: Record<CredentialType, string[]> = {
  identityDocument: ['Date of birth', 'Photograph'],
  driversLicense: ['Photo', 'Expiry date', 'Date of birth'],
}

export const OPTIONAL_FIELDS: Record<CredentialType, string[]> = {
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
