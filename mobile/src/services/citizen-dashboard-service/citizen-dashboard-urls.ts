export const OFFICIAL_ACTIVITY_LIMIT = 20

const citizenDashboardUrls = {
  activity: (): string => '/api/activity/me',
  credentials: (): string => '/api/credentials/me',
  officialActivity: (limit: number = OFFICIAL_ACTIVITY_LIMIT): string =>
    `/api/officials/activity/me?limit=${limit}`,
}

export default citizenDashboardUrls
