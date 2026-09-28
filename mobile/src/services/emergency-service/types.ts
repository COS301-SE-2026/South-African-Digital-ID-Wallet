export type EmergencyFieldKey =
  | 'allergies'
  | 'bloodType'
  | 'communication'
  | 'conditions'
  | 'implants'
  | 'medicalAidNumber'
  | 'medicalAidScheme'
  | 'medication'
  | 'name'

export type EmergencyContact = {
  email?: string | null
  name: string
  phone?: string | null
  priority: number
  relationship: string
}

export type EmergencyProfile = {
  consentGivenAt: string | null
  contacts: EmergencyContact[]
  fields: Partial<Record<EmergencyFieldKey, string>>
  isEnabled: boolean
  medicalLastUpdatedAt: string | null
  offlineFields: EmergencyFieldKey[]
}

export type SaveEmergencyProfileRequest = {
  consentGiven: boolean
  contacts: EmergencyContact[]
  fields: Partial<Record<EmergencyFieldKey, string>>
  isEnabled: boolean
  offlineFields: EmergencyFieldKey[]
}

export type RegisterDeviceRequest = {
  deviceLabel: string
  isStrongBoxBacked: boolean
  platform: 'android' | 'ios'
  publicKeySpki: string
}

export type RegisterDeviceResponse = { handle: string }

export type OfflineCredential = {
  expiresAt: string
  sdJwt: string
}

export type ResolveEmergencyRequest = {
  code: string
  justification: string
  latitude?: number
  longitude?: number
  wasOffline: boolean
}

export type ResolveEmergencyResponse = {
  accessedAt: string
  identity: {
    dateOfBirth: string
    names: string
    photoUrl: string | null
    surname: string
  }
  medical: { key: string; label: string; value: string }[]
  medicalLastUpdatedAt: string | null
  contacts: EmergencyContact[]
}
