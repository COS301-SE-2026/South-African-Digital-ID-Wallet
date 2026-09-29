import type { RevocationReason } from './types'

export const revocationReasons: { value: RevocationReason; label: string }[] = [
  { value: 'expired', label: 'Credential expired' },
  { value: 'lost_stolen', label: 'Lost or stolen' },
  { value: 'fraudulent', label: 'Fraudulent credential' },
  { value: 'citizen_request', label: 'Citizen request' },
  { value: 'compliance_violation', label: 'Compliance violation' },
  { value: 'other', label: 'Other' },
]
