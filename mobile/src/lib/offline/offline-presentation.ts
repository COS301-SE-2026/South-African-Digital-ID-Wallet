import type { OfflinePackage } from './offline-cache'

const CLAIM_NAMES: Record<string, string> = {
  'Date of birth': 'date_of_birth',
  Photograph: 'portrait',
  Photo: 'portrait',
  'Identity number': 'identity_number',
  'Full surname': 'surname',
  'Full forenames': 'forenames',
  'Citizenship status': 'citizenship_status',
  Gender: 'gender',
  'Country of birth': 'country_of_birth',
  'Card issue date and number': 'card_issue_date_and_number',
  Signature: 'signature_image',
  'Expiry date': 'expiry_date',
  'Full name': 'full_name',
  'SA ID number': 'identity_number',
  'License number': 'license_number',
  'License code': 'license_code',
  'Country of issue': 'country_of_issue',
  'Vehicle restrictions': 'vehicle_restrictions',
  'Date of issue': 'issue_date',
}

export const createOfflinePresentation = (
  offlinePackage: OfflinePackage,
  disclosedFields: readonly string[]
): string => {
  const disclosures = disclosedFields
    .filter((field) => CLAIM_NAMES[field] !== 'signature_image')
    .map((field) => {
      const claimName = CLAIM_NAMES[field]

      if (!claimName) {
        throw new Error(`Unsupported offline claim: ${field}`)
      }

      const disclosure = offlinePackage.disclosures[claimName]

      if (!disclosure) {
        throw new Error(`Offline claim is not cached: ${claimName}`)
      }

      return disclosure
    })

  if (disclosures.length === 0) {
    throw new Error('No claims are available for offline presentation.')
  }

  return [offlinePackage.issuerSignedCredential, ...disclosures, ''].join('~')
}
