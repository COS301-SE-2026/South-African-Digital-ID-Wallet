export interface CredentialStats {
  total: number
  active: number
  suspended: number
  expiringSoon: number
}

export interface StatsRowProps {
  stats: CredentialStats
}
