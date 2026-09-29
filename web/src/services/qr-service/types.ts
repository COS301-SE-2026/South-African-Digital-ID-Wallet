import { CredentialType } from './qr-field-definitions'

export type GenerateQrRequest = {
  disclosedFields: string[]
}

export type GenerateQrResponse = {
  token: string
  expiresAt: string
}

export type CredentialSummary = {
  id: string
  credentialType: string
}

export type QrDisclosureSelection = {
  credentialId: string
  credentialType: CredentialType
  mandatoryFields: string[]
  selectedOptionalFields: string[]
}
