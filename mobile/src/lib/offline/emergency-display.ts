import type { ResolveEmergencyResponse } from '@/services/emergency-service'

import {
  EMERGENCY_CLAIM_LABELS,
  EMERGENCY_CONTACT_POSITIONS,
  emergencyContactClaim,
  isEmergencyContactClaim,
} from './emergency-claims'

const NAME_CLAIM = 'full_name'
const UPDATED_CLAIM = 'medical_updated_on'

const toContacts = (claims: Readonly<Record<string, string>>) =>
  EMERGENCY_CONTACT_POSITIONS.flatMap((position) => {
    const name = claims[emergencyContactClaim(position, 'name')]
    if (!name) {
      return []
    }
    return [
      {
        name,
        phone: claims[emergencyContactClaim(position, 'phone')] ?? null,
        priority: position,
        relationship:
          claims[emergencyContactClaim(position, 'relationship')] ?? '',
      },
    ]
  })

export const toOfflineEmergencyProfile = (
  claims: Readonly<Record<string, string>>,
  accessedAt: Date
): ResolveEmergencyResponse => ({
  accessedAt: accessedAt.toISOString(),
  contacts: toContacts(claims),
  identity: {
    dateOfBirth: '',
    names: claims[NAME_CLAIM] ?? 'Name not released for offline use',
    photoUrl: null,
    surname: '',
  },
  medical: Object.entries(claims)
    .filter(
      ([claimName]) =>
        claimName !== NAME_CLAIM &&
        claimName !== UPDATED_CLAIM &&
        !isEmergencyContactClaim(claimName)
    )
    .map(([claimName, value]) => ({
      key: claimName,
      label: EMERGENCY_CLAIM_LABELS[claimName] ?? claimName,
      value,
    })),
  medicalLastUpdatedAt: claims[UPDATED_CLAIM] ?? null,
})
