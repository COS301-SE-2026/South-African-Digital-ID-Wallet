import api from '@/lib/api'
import type { GovAdminAuditLogFilters, GovAdminAuditLogResponse } from './types'
import { GOV_ADMIN_AUDIT_LOG_URLS } from './gov-admin-audit-log-urls'

export const getGovAdminAuditLogs = async (
  filters: GovAdminAuditLogFilters = {}
): Promise<GovAdminAuditLogResponse> => {
  const { data } = await api.get<GovAdminAuditLogResponse>(
    GOV_ADMIN_AUDIT_LOG_URLS.list,
    {
      params: filters,
    }
  )
  return data
}
