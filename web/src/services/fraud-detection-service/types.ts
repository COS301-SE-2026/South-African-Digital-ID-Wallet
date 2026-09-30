export type FraudRiskLevel = 'Low' | 'Medium' | 'High'
export type FraudAlertStatus = 'Open' | 'Secured' | 'Dismissed'
export type SecurityEventType = 'Login' | 'DeviceVerified' | 'QrGenerated'
export type SecureAccountAction =
  | 'LogOutOtherDevices'
  | 'ResetPassword'
  | 'AddExtraVerification'
export type SecurityLocationResponse = {
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  label: string
  occurredAt: string
}
export type FraudSignalResponse = {
  code: string
  description: string
  weight: number
}
export type SecureActionOptionResponse = {
  action: SecureAccountAction
  title: string
  description: string
  isRecommended: boolean
}
export type FraudAlertSummaryResponse = {
  id: string
  title: string
  message: string
  riskScore: number
  riskLevel: FraudRiskLevel
  status: FraudAlertStatus
  isImpossibleTravel: boolean
  eventType: SecurityEventType
  detectedAt: string
  previousLocationLabel: string | null
  suspiciousLocationLabel: string
}
export type FraudAlertDetailsResponse = FraudAlertSummaryResponse & {
  ipAddress: string
  deviceDescription: string
  isNewDevice: boolean
  isTrustedDevice: boolean
  distanceKm: number | null
  elapsedMinutes: number | null
  impliedSpeedKmh: number | null
  previousLocation: SecurityLocationResponse | null
  suspiciousLocation: SecurityLocationResponse
  signals: FraudSignalResponse[]
  availableActions: SecureActionOptionResponse[]
  resolvedAt: string | null
  resolutionAction: SecureAccountAction | null
}
export type SecurityActivityItemResponse = {
  id: string
  eventType: SecurityEventType
  title: string
  locationLabel: string
  occurredAt: string
  deviceDescription: string
  isTrustedDevice: boolean
  riskScore: number
  riskLevel: FraudRiskLevel
  isSuspicious: boolean
}
export type SecurityOverviewResponse = {
  hasActiveAlert: boolean
  activeAlertCount: number
  latestAlert: FraudAlertSummaryResponse | null
  qrGenerationRestricted: boolean
  qrRestrictedUntil: string | null
  recentActivity: SecurityActivityItemResponse[]
}
export type SecureAccountRequest = {
  action: SecureAccountAction
  password: string
}
export type SecureAccountResultResponse = {
  alertId: string
  action: SecureAccountAction
  title: string
  message: string
  nextSteps: string[]
  devicesRemoved: number
  requiresPasswordChange: boolean
  token?: string
  expiresAt?: string
}
export type DismissFraudAlertRequest = {
  password: string
}
export type SecuritySettingsResponse = {
  deviceVerificationEnabled: boolean
  enhancedVerificationEnabled: boolean
  impossibleTravelDetectionEnabled: boolean
  trustedDeviceCount: number
  qrGenerationRestricted: boolean
  qrRestrictedUntil: string | null
}
export type UpdateSecuritySettingsRequest = {
  impossibleTravelDetectionEnabled?: boolean
  enhancedVerificationEnabled?: boolean
  password?: string
}
