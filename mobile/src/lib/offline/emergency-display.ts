import type { ResolveEmergencyResponse } from '@/services/emergency-service'

import { EMERGENCY_CLAIM_LABELS } from './emergency-claims'

const NAME_CLAIM = 'full_name'
const UPDATED_CLAIM = 'medical_updated_on'

export const toOfflineEmergencyProfile = (
  claims: Readonly<Record<string, string>>,
  accessedAt: Date
): ResolveEmergencyResponse => ({
  accessedAt: accessedAt.toISOString(),
  contacts: [],
  identity: {
    dateOfBirth: '',
    names: claims[NAME_CLAIM] ?? 'Name not released for offline use',
    photoUrl: null,
    surname: '',
  },
  medical: Object.entries(claims)
    .filter(
      ([claimName]) => claimName !== NAME_CLAIM && claimName !== UPDATED_CLAIM
    )
    .map(([claimName, value]) => ({
      key: claimName,
      label: EMERGENCY_CLAIM_LABELS[claimName] ?? claimName,
      value,
    })),
  medicalLastUpdatedAt: claims[UPDATED_CLAIM] ?? null,
})
