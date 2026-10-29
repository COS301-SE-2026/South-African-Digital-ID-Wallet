import { type UserRole } from '@/types/roles'

export const PERMISSIONS_ROUTING: Record<string, UserRole[]> = {
  '/citizen': ['Citizen'],
  '/citizen/activate-credentials': ['Citizen'],
  '/citizen/manage-user-account': ['Citizen'],
  '/officials': ['Official'],
  '/officials/onboard-citizen': ['Official'],
  '/gov-admin': ['GovernmentAdministrator'],
  '/gov-admin/upload-institution': ['GovernmentAdministrator'],
  '/gov-admin/view-institutions': ['GovernmentAdministrator'],
}

export function getAllowedRoles(pathname: string): UserRole[] | null {
  if (PERMISSIONS_ROUTING[pathname]) {
    return PERMISSIONS_ROUTING[pathname]
  }

  const sortedRoutes = Object.keys(PERMISSIONS_ROUTING).sort(
    (a, b) => b.length - a.length
  )
  for (const route of sortedRoutes) {
    if (pathname.startsWith(route + '/')) {
      return PERMISSIONS_ROUTING[route]
    }
  }

  const PROTECTED_ROUTES = ['/citizen', '/officials', '/gov-admin']

  if (PROTECTED_ROUTES.some((prefix) => pathname.startsWith(prefix))) {
    return []
  }
  return null
}
