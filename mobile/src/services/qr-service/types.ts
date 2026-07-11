export type GenerateQrRequest = {
  disclosedFields: string[]
}

export type GenerateQrResponse = {
  token: string
  expiresAt: string
}
