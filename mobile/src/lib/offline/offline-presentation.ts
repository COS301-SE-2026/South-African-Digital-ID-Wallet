import { base64urlnopad } from '@scure/base'

import type { OfflinePackage } from './offline-cache'
import { MANDATORY_CLAIMS } from './verify'

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

// D-011: the handwritten signature image never travels offline.
const EXCLUDED_CLAIMS = new Set(['signature_image'])

type IssuerClaims = { vct: string; exp: number }

// Read from the signed credential itself rather than the server's timestamp strings: exp is plain
// unix seconds, and .NET's seven-digit fractional seconds are not guaranteed to parse on Hermes.
const readIssuerClaims = (
  offlinePackage: OfflinePackage
): IssuerClaims | null => {
  try {
    const payloadSegment =
      offlinePackage.issuerSignedCredential.split('.')[1] ?? ''
    const payload = JSON.parse(
      new TextDecoder().decode(base64urlnopad.decode(payloadSegment))
    )

    return typeof payload.vct === 'string' && typeof payload.exp === 'number'
      ? { vct: payload.vct, exp: payload.exp }
      : null
  } catch {
    return null
  }
}

export const isPackageUsable = (
  offlinePackage: OfflinePackage,
  nowInSeconds: number
): boolean => {
  const claims = readIssuerClaims(offlinePackage)

  return claims !== null && claims.exp > nowInSeconds
}

export const createOfflinePresentation = (
  offlinePackage: OfflinePackage,
  selectedFields: readonly string[]
): string => {
  const issuerClaims = readIssuerClaims(offlinePackage)
  const mandatory = issuerClaims
    ? MANDATORY_CLAIMS[issuerClaims.vct]
    : undefined

  if (!mandatory) {
    throw new Error('This credential cannot be presented offline.')
  }

  const selectedClaims = selectedFields.map((field) => {
    const claimName = CLAIM_NAMES[field]

    if (!claimName) {
      throw new Error(`Unsupported offline claim: ${field}`)
    }

    return claimName
  })

  // Mandatory claims are always presented, because a verifier rejects a presentation without them,
  // so the code works even before the citizen has chosen optional fields.
  const claimNames = [...new Set([...mandatory, ...selectedClaims])].filter(
    (claimName) => !EXCLUDED_CLAIMS.has(claimName)
  )

  const disclosures = claimNames.flatMap((claimName) => {
    const disclosure = offlinePackage.disclosures[claimName]

    if (disclosure) {
      return [disclosure]
    }

    if (mandatory.includes(claimName)) {
      throw new Error(`Offline claim is not cached: ${claimName}`)
    }

    // The backend omits optional claims the citizen has no value for, so there is nothing to show.
    return []
  })

  return [offlinePackage.issuerSignedCredential, ...disclosures, ''].join('~')
}
