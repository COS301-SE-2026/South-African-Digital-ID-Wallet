export type ResolveCredentialResponse = {
  credentialType: string
  disclosedFields: Record<string, string>
}

export type ParsedScannedToken =
  | { type: 'disclosure'; token: string }
  | { type: 'badge'; token: string }
