// Must match the backend's AuditEventTypeExtensions.OfficialWorkEvents
export type OfficialActivityEventType =
  | 'OnboardCitizen'
  | 'OnboardCitizenFailed'
  | 'CredentialIssued'
  | 'CredentialVerified'
  | 'CitizenVerificationFailed'
  | 'OfflineCredentialVerified'
  | 'OfflineVerificationRejected'
  | 'EmergencyProfileAccessed'
  | 'EmergencyProfileAccessFailed'
export type OfficialActivityItem = {
  id: string
  eventType: OfficialActivityEventType
  details: string
  summary: string
  createdAt: string
}
export type OfficialActivityResponse = {
  items: OfficialActivityItem[]
}
export type AuditLogOutcome = 'Success' | 'Failed'
export type AuditLogCategory = 'work' | 'security' | 'all'
export type AuditLogItem = {
  id: string
  createdAt: string
  action: string
  details: string
  summary: string
  citizenName: string | null
  citizenSaId: string | null
  performedBy: string
  outcome: AuditLogOutcome
}
export type AuditLogHistoryResponse = {
  items: AuditLogItem[]
  page: number
  pageSize: number
  totalCount: number
}
export type AuditLogFilters = {
  search?: string
  action?: string
  dateFrom?: string
  dateTo?: string
  type?: AuditLogOutcome
  category?: Exclude<AuditLogCategory, 'all'>
  page?: number
  pageSize?: number
}
