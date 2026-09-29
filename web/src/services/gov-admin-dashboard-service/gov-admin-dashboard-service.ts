import api from '@/lib/api'
import type { AnalyticsOverviewData } from '@/components/organisms/analytics-overview/types'
import { GOV_ADMIN_DASHBOARD_URLS } from './gov-admin-dashboard-urls'
import type {
  GovernmentAdminAnalyticsData,
  GovernmentAdminAnalyticsResponse,
  GovernmentAdminDashboardSummary,
} from './types'

export const getGovernmentAdminDashboardSummary =
  async (): Promise<GovernmentAdminDashboardSummary> => {
    const response = await api.get<GovernmentAdminDashboardSummary>(
      GOV_ADMIN_DASHBOARD_URLS.summary
    )
    return response.data
  }

export const getGovernmentAdminAnalytics = async (
  range: '7d' | '30d' | '90d'
): Promise<GovernmentAdminAnalyticsData> => {
  const response = await api.get<GovernmentAdminAnalyticsResponse>(
    GOV_ADMIN_DASHBOARD_URLS.analytics,
    {
      params: {
        range,
      },
    }
  )
  return normalizeAnalytics(response.data, range)
}

const normalizeAnalytics = (
  response: GovernmentAdminAnalyticsResponse,
  range: '7d' | '30d' | '90d'
): AnalyticsOverviewData => {
  const rangeDays = Number.parseInt(range, 10)
  const mapMetric = (
    metric: GovernmentAdminAnalyticsResponse[keyof GovernmentAdminAnalyticsResponse]
  ) => ({
    value: metric.value,
    changePct: metric.changePct ?? 0,
    series: metric.series.map((point) => point.count),
  })
  return {
    rangeDays,
    verifications: mapMetric(response.verifications),
    credentialsIssued: mapMetric(response.credentialsIssued),
    activeOfficials: mapMetric(response.activeOfficials),
    activeInstitutions: mapMetric(response.activeInstitutions),
  }
}
