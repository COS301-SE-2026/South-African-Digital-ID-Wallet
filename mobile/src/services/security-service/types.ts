import type { LucideIcon } from 'lucide-react-native'
import type { IconTileTone } from '@/components/atoms'
import type { StatusBadgeTone } from '@/components/molecules'

export type SecurityEventType = 'Login' | 'DeviceVerified' | 'QrGenerated'

export type FraudRiskLevel = 'Low' | 'Medium' | 'High'

export type FraudAlertStatus = 'Open' | 'Secured' | 'Dismissed'

export type SecureAccountAction =
  | 'LogOutOtherDevices'
  | 'ResetPassword'
  | 'AddExtraVerification'

export type SecurityLocationResponse = {
  city: string | null
  country: string | null
  label: string
  latitude: number | null
  longitude: number | null
  occurredAt: string
}

export type FraudSignalResponse = {
  code: string
  description: string
  weight: number
}

export type SecureActionOptionResponse = {
  action: SecureAccountAction
  description: string
  isRecommended: boolean
  title: string
}

export type FraudAlertSummaryResponse = {
  detectedAt: string
  eventType: SecurityEventType
  id: string
  isImpossibleTravel: boolean
  message: string
  previousLocationLabel: string | null
  riskLevel: FraudRiskLevel
  riskScore: number
  status: FraudAlertStatus
  suspiciousLocationLabel: string
  title: string
}

export type FraudAlertDetailsResponse = FraudAlertSummaryResponse & {
  availableActions: SecureActionOptionResponse[]
  deviceDescription: string
  distanceKm: number | null
  elapsedMinutes: number | null
  impliedSpeedKmh: number | null
  ipAddress: string
  isNewDevice: boolean
  isTrustedDevice: boolean
  previousLocation: SecurityLocationResponse | null
  resolutionAction: SecureAccountAction | null
  resolvedAt: string | null
  signals: FraudSignalResponse[]
  suspiciousLocation: SecurityLocationResponse
}

export type SecurityActivityResponse = {
  deviceDescription: string
  eventType: SecurityEventType
  id: string
  isSuspicious: boolean
  isTrustedDevice: boolean
  locationLabel: string
  occurredAt: string
  riskLevel: FraudRiskLevel
  riskScore: number
  title: string
}

export type SecurityOverviewResponse = {
  activeAlertCount: number
  hasActiveAlert: boolean
  latestAlert: FraudAlertSummaryResponse | null
  qrGenerationRestricted: boolean
  qrRestrictedUntil: string | null
  recentActivity: SecurityActivityResponse[]
}

export type SecurityAlertNotice = {
  alertId: string
  deviceDescription: string
  location: string
  message: string
  occurredAt: string
  qrGenerationRestricted: boolean
  qrRestrictedUntil: string | null
  riskLevel: FraudRiskLevel
  riskScore: number
  title: string
}

export type SecureAccountRequest = {
  action: SecureAccountAction
  password: string
}

export type SecureAccountResponse = {
  action: SecureAccountAction
  alertId: string
  devicesRemoved: number
  expiresAt?: string
  message: string
  nextSteps: string[]
  requiresPasswordChange: boolean
  title: string
  token?: string
}

export type DismissAlertRequest = {
  password: string
}

export type SecuritySettingsResponse = {
  deviceVerificationEnabled: boolean
  enhancedVerificationEnabled: boolean
  impossibleTravelDetectionEnabled: boolean
  qrGenerationRestricted: boolean
  qrRestrictedUntil: string | null
  trustedDeviceCount: number
}

export type SecuritySettingKey =
  | 'enhancedVerificationEnabled'
  | 'impossibleTravelDetectionEnabled'

export type UpdateSecuritySettingsRequest = Partial<
  Record<SecuritySettingKey, boolean>
> & {
  password?: string
}

export type SecurityService = {
  dismissAlert: (alertId: string, request: DismissAlertRequest) => Promise<void>
  getActivity: (limit?: number) => Promise<SecurityActivityResponse[]>
  getAlert: (alertId: string) => Promise<FraudAlertDetailsResponse>
  getOverview: () => Promise<SecurityOverviewResponse>
  getSettings: () => Promise<SecuritySettingsResponse>
  secureAccount: (
    alertId: string,
    request: SecureAccountRequest
  ) => Promise<SecureAccountResponse>
  updateSettings: (
    request: UpdateSecuritySettingsRequest
  ) => Promise<SecuritySettingsResponse>
}

export type SecurityBadge = {
  label: string
  tone: StatusBadgeTone
}

export type SecurityActivityEntry = {
  badge: SecurityBadge | null
  description: string
  Icon: LucideIcon
  id: string
  timestamp: string
  title: string
  tone: IconTileTone
}

export type SecurityDetail = {
  badge?: SecurityBadge
  hint?: string
  Icon: LucideIcon
  label: string
  value: string
}

export type SecurityStat = {
  label: string
  value: string
}
