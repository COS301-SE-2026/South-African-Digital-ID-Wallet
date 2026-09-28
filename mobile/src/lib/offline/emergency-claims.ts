import type { ClaimSet } from './verify'

export const EMERGENCY_VCT = 'urn:flashid:emergency-profile:1'

export const EMERGENCY_CLAIM_LABELS: Readonly<Record<string, string>> = {
  full_name: 'Full name',
  allergies: 'Severe allergies',
  medication: 'Blood thinners & chronic medication',
  implants: 'Implanted devices',
  medical_conditions: 'Medical conditions',
  blood_type: 'Blood type',
  communication_needs: 'Communication needs',
  medical_aid_scheme: 'Medical aid scheme',
  medical_aid_number: 'Medical aid number',
  medical_updated_on: 'Medical information updated',
}

export const EMERGENCY_CLAIM_SET: ClaimSet = {
  vct: EMERGENCY_VCT,
  allowedClaims: Object.keys(EMERGENCY_CLAIM_LABELS),
  mandatoryClaims: ['medical_updated_on'],
}
