export type BadgeTokenResponse = {
  expiresAt: string
  token: string
}

export type VerifyBadgeResponse = {
  institutionName: string
  institutionType: string
  mode: string
  suggestedDriversLicenseFields: string[]
  suggestedIdentityDocumentFields: string[]
}

export type OfficerBadge = {
  expiresAt: string
  institutionName: string
  institutionType: string
  token: string
}

export type OfficialStatsResponse = {
  todayCount: number
  isCapped: boolean
}
