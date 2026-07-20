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
