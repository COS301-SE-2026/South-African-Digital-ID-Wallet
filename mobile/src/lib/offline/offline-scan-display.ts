import { base64, base64urlnopad } from '@scure/base'

import type { VerificationFailureCode } from './verify'
import { CLAIM_LABELS } from './claim-labels'

const CREDENTIAL_TYPES: Readonly<Record<string, string>> = {
  'urn:flashid:identity-document:1': 'Identity Document',
  'urn:flashid:drivers-license:1': "Driver's License",
}

export type OfflineScanDisplay = {
  credentialType: string
  disclosedFields: Record<string, string>
}

export const toOfflineScanDisplay = (
  vct: string,
  claims: Readonly<Record<string, string>>
): OfflineScanDisplay => {
  const labels = CLAIM_LABELS[vct] ?? {}

  const disclosedFields = Object.fromEntries(
    Object.entries(claims).map(([claimName, value]) => [
      labels[claimName] ?? claimName,
      // React Native's Image needs a data URI in standard base64, and the credential carries
      // base64url (D-018).
      claimName === 'portrait'
        ? `data:image/webp;base64,${base64.encode(base64urlnopad.decode(value))}`
        : value,
    ])
  )

  return {
    credentialType: CREDENTIAL_TYPES[vct] ?? 'Credential',
    disclosedFields,
  }
}

// Until the issuer signature is checked, nothing in the credential can be trusted, so those failures
// say only that it did not come from FlashID rather than repeating attacker-chosen detail.
const FAILURE_MESSAGES: Readonly<Record<VerificationFailureCode, string>> = {
  MALFORMED: 'This code could not be read. Ask the citizen to show it again.',
  UNSUPPORTED_ALG: 'This credential was not issued by FlashID.',
  UNKNOWN_KEY:
    'This phone does not recognise the key this credential was signed with. Connect to update verification data.',
  REVOKED_KEY:
    'This credential was signed with a key that is no longer trusted.',
  BAD_ISSUER_SIGNATURE: 'This credential was not issued by FlashID.',
  EXPIRED:
    'This credential has expired. Ask the citizen to connect and refresh it.',
  CREDENTIAL_REVOKED: 'This credential has been revoked.',
  DISCLOSURE_NOT_IN_SD: 'This credential has been tampered with.',
  DUPLICATE_DISCLOSURE: 'This credential has been tampered with.',
  MISSING_MANDATORY_CLAIM: 'This code is missing required information.',
  MISSING_KEY_BINDING: "This code could not be linked to the citizen's phone.",
  BAD_KEY_BINDING_SIGNATURE:
    "This code could not be linked to the citizen's phone.",
  SD_HASH_MISMATCH: 'This credential has been tampered with.',
  STALE_PRESENTATION:
    'This code has expired. Ask the citizen to show it again.',
  STALE_TRUST_DATA:
    'Verification data on this phone is missing or over 7 days old. Connect to update it.',
}

export const describeVerificationFailure = (
  code: VerificationFailureCode
): string => FAILURE_MESSAGES[code]
