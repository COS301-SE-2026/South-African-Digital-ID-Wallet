import type { AnalyticsOverviewData } from '@/components/organisms/analytics-overview/types'
export interface GovernmentAdminSystemStatus {
  operational: boolean
  lastUpdatedAt: string
}
export interface GovernmentAdminCounts {
  users: number
  institutions: number
  credentialsIssued: number
}
export interface GovernmentAdminActivityItem {
  id: string
  eventType: string
  details: string
  createdAt: string
}
export interface GovernmentAdminDashboardSummary {
  systemStatus: GovernmentAdminSystemStatus
  counts: GovernmentAdminCounts
  activityFeed: GovernmentAdminActivityItem[]
}
export interface GovernmentAdminDailyPoint {
  date: string
  count: number
}
export interface GovernmentAdminAnalyticsMetric {
  value: number
  changePct: number | null
  series: GovernmentAdminDailyPoint[]
}
export interface GovernmentAdminAnalyticsResponse {
  verifications: GovernmentAdminAnalyticsMetric
  credentialsIssued: GovernmentAdminAnalyticsMetric
  activeOfficials: GovernmentAdminAnalyticsMetric
  activeInstitutions: GovernmentAdminAnalyticsMetric
}
export type GovernmentAdminAnalyticsData = AnalyticsOverviewData
