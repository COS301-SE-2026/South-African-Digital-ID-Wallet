export type ResolveCredentialResponse = {
  credentialType: string
  disclosedFields: Record<string, string>
}

export type InstitutionType =
  | 'HomeAffairs'
  | 'LicensingDepartment'
  | 'LawEnforcement'
  | 'Healthcare'
  | 'FinancialInstitution'

export type DisclosurePolicyMode = 'Required' | 'Suggested'

export type VerifyBadgeResponse = {
  institutionName: string
  institutionType: InstitutionType
  mode: DisclosurePolicyMode
  suggestedIdentityDocumentFields: string[]
  suggestedDriversLicenseFields: string[]
}

export type GenerateBadgeTokenResponse = {
  token: string
  expiresAt: string
}
