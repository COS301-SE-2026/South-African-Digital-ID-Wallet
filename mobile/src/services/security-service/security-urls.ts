export const SECURITY_ACTIVITY_LIMIT = 20

const securityUrls = {
  activity: (limit: number = SECURITY_ACTIVITY_LIMIT): string =>
    `/api/security/activity?limit=${limit}`,
  alert: (alertId: string): string =>
    `/api/security/alerts/${encodeURIComponent(alertId)}`,
  overview: (): string => '/api/security/overview',
  secure: (alertId: string): string =>
    `/api/security/alerts/${encodeURIComponent(alertId)}/secure`,
}

export default securityUrls
