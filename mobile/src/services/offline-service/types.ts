export type OfflinePackageResponse = {
  issuerSignedCredential: string
  disclosures: Record<string, string>
  signedAt: string
  expiresAt: string
}

export type IssuerKeyResponse = {
  kid: string
  kty: string
  crv: string
  x: string
  y: string
  status: 'active' | 'retired' | 'revoked'
}

export type IssuerKeysResponse = {
  keys: IssuerKeyResponse[]
  retrievedAt: string
}
