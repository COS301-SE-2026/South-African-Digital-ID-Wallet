export type OfficialActivityEventType =
  | 'OnboardCitizen'
  | 'OnboardCitizenFailed'
  | 'DriverLicenseIssued'
  | 'QrCodeVerified'
export type OfficialActivityItem = {
  id: string
  eventType: OfficialActivityEventType
  details: string
  createdAt: string
}
export type OfficialActivityResponse = {
  items: OfficialActivityItem[]
}
export type AuditLogOutcome = 'Success' | 'Failed'
export type AuditLogItem = {
  id: string
  createdAt: string
  action: string
  details: string
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
  page?: number
  pageSize?: number
}
