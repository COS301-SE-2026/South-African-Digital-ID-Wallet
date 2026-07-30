import {
  getAllowedRoles,
  PERMISSIONS_ROUTING,
} from '@/config/roles/route-permissions'

describe('getAllowedRoles', () => {
  it('Should return the roles for the route paths', () => {
    expect(getAllowedRoles('/citizen')).toEqual(['Citizen'])
    expect(getAllowedRoles('/officials')).toEqual(['Official'])
    expect(getAllowedRoles('/gov-admin')).toEqual(['GovernmentAdministrator'])
  })

  it('Shoould inherit roles from the nearest mapped parent route', () => {
    expect(getAllowedRoles('/citizen/qr')).toEqual(['Citizen'])
    expect(getAllowedRoles('/officials/verifications')).toEqual(['Official'])
    expect(getAllowedRoles('/gov-admin/view-institutions/abc-123')).toEqual([
      'GovernmentAdministrator',
    ])
  })

  it('Should prefer the longes matching route', () => {
    expect(getAllowedRoles('/citizen/manage-user-account/settings')).toEqual([
      'Citizen',
    ])
  })

  it.each(['/', '/login', '/register', '/verify-email'])(
    'should return null for public routes',
    (pathname) => {
      expect(getAllowedRoles(pathname)).toBeNull()
    }
  )

  it.each(['/citizen-portal', '/officials-list', '/gov-administration'])(
    'should lock down on which only shares a protected prefix',
    (pathname) => {
      expect(getAllowedRoles(pathname)).toEqual([])
    }
  )

  it('Should resolve every config rooute to its own role', () => {
    for (const [route, roles] of Object.entries(PERMISSIONS_ROUTING)) {
      expect(roles.length).toBeGreaterThan(0)
      expect(getAllowedRoles(route)).toEqual(roles)
    }
  })
})
