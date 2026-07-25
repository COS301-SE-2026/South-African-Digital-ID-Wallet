import { jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

import { DEFAULT_USER_ROLE_DASHBOARD, type UserRole } from '@/types/roles'

export async function proxy(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value

  const requestedPath = `${req.nextUrl.pathname}${req.nextUrl.search}`

  if (!token) {
    return redirectToLogin(req, requestedPath)
  }

  try {
    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      return redirectToLogin(req, requestedPath)
    }

    const secret = new TextEncoder().encode(jwtSecret)
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'FlashID',
      audience: 'FlashID-Users',
    })

    const sub = payload['sub'] as string | undefined
    const role = payload['role'] as string | undefined

    if (!sub || !role) {
      return redirectToLogin(req, requestedPath)
    }

    const dashboardRole = DEFAULT_USER_ROLE_DASHBOARD[role as UserRole]

    if (!dashboardRole || !req.nextUrl.pathname.startsWith(dashboardRole)) {
      return NextResponse.redirect(new URL(dashboardRole ?? '/', req.url))
    }
    return NextResponse.next()
  } catch {
    return redirectToLogin(req, requestedPath)
  }
}

function redirectToLogin(req: NextRequest, returnTo: string) {
  const loginUrl = new URL('/', req.url)
  loginUrl.searchParams.set('returnTo', returnTo)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/citizen/:path*', '/officials/:path*', '/gov-admin/:path*'],
}
