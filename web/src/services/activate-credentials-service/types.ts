export type CredentialType = 'identityDocument' | 'driversLicense'

export const CREDENTIAL_TYPE_MAP: Record<CredentialType, string> = {
  identityDocument: 'IdentityDocument',
  driversLicense: 'DriversLicense',
}

export type ActivateCredentialsRequest = {
  credentialTypes: string[]
}

export type ActivateCredentialsResponse = {
  status: string
  message: string
}
