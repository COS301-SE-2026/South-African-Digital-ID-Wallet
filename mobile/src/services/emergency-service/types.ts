export type EmergencyFieldKey =
  | 'allergies'
  | 'bloodThinners'
  | 'bloodType'
  | 'communication'
  | 'conditions'
  | 'implants'
  | 'medicalAid'
  | 'medication'
  | 'name'

export type EmergencyContact = {
  email: string
  name: string
  phone?: string
  relationship: string
}

export type EmergencyProfile = {
  contacts: EmergencyContact[]
  fields: Partial<Record<EmergencyFieldKey, string>>
  isEnabled: boolean
  medicalLastUpdatedAt: string | null
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
  payload: string
  signature: string
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
  medical: { key: EmergencyFieldKey; label: string; value: string }[]
  medicalLastUpdatedAt: string | null
  contacts: EmergencyContact[]
}
