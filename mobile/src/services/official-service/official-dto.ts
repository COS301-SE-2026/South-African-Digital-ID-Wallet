import type {
  BadgeTokenResponse,
  OfficerBadge,
  VerifyBadgeResponse,
} from './types'

export const formatInstitutionType = (value: string): string =>
  (value ?? '').replace(/([a-z])([A-Z])/g, '$1 $2').trim()

export const toOfficerBadge = (
  issued: BadgeTokenResponse,
  verified: VerifyBadgeResponse
): OfficerBadge => ({
  expiresAt: issued.expiresAt,
  institutionName: verified.institutionName,
  institutionType: formatInstitutionType(verified.institutionType),
  token: issued.token,
})
