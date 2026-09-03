import type { AuditLogQuery } from './types'

export const AUDIT_LOG_PAGE_SIZE = 15

const toQuery = (
  params: Record<string, string | number | undefined>
): string => {
  const parts = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
  return parts.length === 0 ? '' : `?${parts.join('&')}`
}

const auditLogUrls = {
  actions: (): string => '/api/officials/history/actions',
  history: (query: AuditLogQuery, page: number): string =>
    `/api/officials/history${toQuery({
      action: query.action,
      page,
      pageSize: AUDIT_LOG_PAGE_SIZE,
      search: query.search.trim() || undefined,
      type: query.outcome === 'all' ? undefined : query.outcome,
    })}`,
}

export default auditLogUrls
