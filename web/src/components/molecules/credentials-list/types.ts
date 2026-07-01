export type CredentialItem = {
  id: string
  title: string
  issuer: string
  issued: string
}

export type CredentialsListProps = {
  credentials?: CredentialItem[]
}
