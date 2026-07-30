export type CredentialType = 'identityDocument' | 'driversLicense'

export const CREDENTIAL_TYPE_MAP: Record<CredentialType, number> = {
  identityDocument: 0,
  driversLicense: 1,
}

export type ActivateCredentialsRequest = {
  credentialTypes: number[]
}

export type ActivateCredentialsResponse = {
  status: string
  message: string
}
