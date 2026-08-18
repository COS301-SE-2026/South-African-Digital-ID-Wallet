export type RegisterInstitutionFormValues = {
  institutionName: string
  institutionType: string
  verificationNumber: string
  adminId: string
  contactEmail: string
}

export type RegisterInstitutionResponse = {
  institutionId: string
  name: string
  type: string
  apiKeyReference: string
  verificationNumber: string
  createdAt: string
}

export type GetInstitutionResponse = {
  institutionId: string
  name: string
  type: string
  verificationNumber: string
  registeredById: string
  createdAt: string
}

export type RevealApiKeyResponse = {
  apiKey: string
}

export type RegenerateApiKeyResponse = {
  institutionId: string
  regeneratedAt: string
}
