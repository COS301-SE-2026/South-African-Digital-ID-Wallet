export type UserRole = 'Official' | 'GovernmentAdministrator' | 'Citizen'

export const DEFAULT_USER_ROLE_DASHBOARD: Record<UserRole, string> = {
  Official: '/officials',
  GovernmentAdministrator: '/gov-admin',
  Citizen: '/citizen',
}
