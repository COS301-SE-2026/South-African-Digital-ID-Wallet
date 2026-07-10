import { create } from 'zustand'

export type CredentialType = 'identityDocument' | 'driversLicense'

type QrDisclosureState = {
  credentialType: CredentialType
  mandatoryFields: string[]
  selectedOptionalFields: string[]
  setSelection: (params: {
    credentialType: CredentialType
    mandatoryFields: string[]
    selectedOptionalFields: string[]
  }) => void
}

export const useQrDisclosureStore = create<QrDisclosureState>((set) => ({
  credentialType: 'identityDocument',
  mandatoryFields: [],
  selectedOptionalFields: [],
  setSelection: ({ credentialType, mandatoryFields, selectedOptionalFields }) =>
    set({ credentialType, mandatoryFields, selectedOptionalFields }),
}))
