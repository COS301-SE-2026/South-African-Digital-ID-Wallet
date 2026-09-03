export type AnalyticsRange = '7d' | '30d' | '90d'

export type AnalyticsMetric = {
  value: number
  changePct: number
  series: number[]
}

export type AnalyticsOverviewData = {
  rangeDays: number
  verifications: AnalyticsMetric
  credentialsIssued: AnalyticsMetric
  activeOfficials: AnalyticsMetric
  activeInstitutions: AnalyticsMetric
}

export type AnalyticsOverviewProps = {
  data: AnalyticsOverviewData | null
  range: AnalyticsRange
  onRangeChange: (range: AnalyticsRange) => void
  isLoading?: boolean
}
