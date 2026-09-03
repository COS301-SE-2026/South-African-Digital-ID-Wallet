import api from '@/lib/api'
import type {
  AuditLogFilters,
  AuditLogHistoryResponse,
  OfficialActivityResponse,
} from './types'
import { OFFICIAL_DASHBOARD_URLS } from './official-dashboard-urls'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
export const getOfficialActivity = async (
  limit = 5
): Promise<OfficialActivityResponse> => {
  const { data } = await api.get<OfficialActivityResponse>(
    OFFICIAL_DASHBOARD_URLS.activity,
    {
      params: {
        limit,
      },
    }
  )
  return data
}

export const getOfficialAuditLogs = async (
  filters: AuditLogFilters = {}
): Promise<AuditLogHistoryResponse> => {
  const { data } = await api.get<AuditLogHistoryResponse>(
    OFFICIAL_DASHBOARD_URLS.history,
    {
      params: filters,
    }
  )
  return data
}
