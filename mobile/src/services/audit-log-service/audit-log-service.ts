import type { AxiosResponse } from 'axios'

import api from '@/lib/api'

import auditLogUrls from './audit-log-urls'
import type {
  AuditLogActionsResponse,
  AuditLogQuery,
  AuditLogResponse,
} from './types'

const getHistory = (query: AuditLogQuery, page: number) =>
  api
    .get(auditLogUrls.history(query, page))
    .then((res: AxiosResponse<AuditLogResponse>) => res.data)

const getActions = () =>
  api
    .get(auditLogUrls.actions())
    .then((res: AxiosResponse<AuditLogActionsResponse>) => res.data.actions)

const auditLogService = { getActions, getHistory }

export default auditLogService
