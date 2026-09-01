export type OfficialActivityEventType =
  | 'OnboardCitizen'
  | 'OnboardCitizenFailed'
  | 'DriverLicenseIssued'
  | 'QrCodeVerified'
export interface OfficialActivityItem {
  id: string
  eventType: OfficialActivityEventType
  details: string
  createdAt: string
}
export interface OfficialActivityResponse {
  items: OfficialActivityItem[]
}
export type AuditLogOutcome = 'Success' | 'Failed'
export interface AuditLogItem {
  id: string
  createdAt: string
  action: string
  citizenName: string
  citizenIdMasked: string
  performedBy: string
  outcome: AuditLogOutcome
}
export interface AuditLogHistoryResponse {
  items: AuditLogItem[]
  page: number
  pageSize: number
  totalCount: number
}
export interface AuditLogFilters {
  search?: string
  action?: string
  dateFrom?: string
  dateTo?: string
  type?: AuditLogOutcome
  page?: number
  pageSize?: number
}
