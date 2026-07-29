import { create } from 'zustand'

export type CredentialType = 'identityDocument' | 'driversLicense'

type QrDisclosureState = {
  credentialId: string
  credentialType: CredentialType
  mandatoryFields: string[]
  selectedOptionalFields: string[]
  setSelection: (params: {
    credentialId: string
    credentialType: CredentialType
    mandatoryFields: string[]
    selectedOptionalFields: string[]
  }) => void
}

export const useQrDisclosureStore = create<QrDisclosureState>((set) => ({
  credentialId: '',
  credentialType: 'identityDocument',
  mandatoryFields: [],
  selectedOptionalFields: [],
  setSelection: ({
    credentialId,
    credentialType,
    mandatoryFields,
    selectedOptionalFields,
  }) =>
    set({
      credentialId,
      credentialType,
      mandatoryFields,
      selectedOptionalFields,
    }),
}))
