export type CredentialType = 'identityDocument' | 'driversLicense'

export const MANDATORY_FIELDS: Record<CredentialType, string[]> = {
  identityDocument: [
    'Identity number',
    'Full surname',
    'Full forenames',
    'Date of birth',
    'Citizenship status',
    'Photograph',
  ],
  driversLicense: [
    'Full name',
    'SA ID number',
    'Photo',
    'License number',
    'License code',
    'Expiry date',
    'Country of issue',
  ],
}

export const OPTIONAL_FIELDS: Record<CredentialType, string[]> = {
  identityDocument: [
    'Gender',
    'Country of birth',
    'Signature',
    'Card issue date and number',
  ],
  driversLicense: [
    'Signature',
    'Date of birth',
    'Vehicle restrictions',
    'Date of issue',
  ],
}
