export type QrCredentialType = 'identityDocument' | 'driversLicense'

export type GenerateQrRequest = {
  disclosedFields: string[]
}

export type GenerateQrResponse = {
  expiresAt: string
  token: string
}
