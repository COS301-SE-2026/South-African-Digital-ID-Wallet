import { jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

import { DEFAULT_USER_ROLE_DASHBOARD, type UserRole } from '@/types/roles'

const ACTIVATE_CREDENTIALS_ROUTE = '/citizen/activate-credentials'

export async function proxy(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value

  if (!token) {
    return redirectToLogin(req)
  }

  try {
    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      return redirectToLogin(req)
    }

    const secret = new TextEncoder().encode(jwtSecret)
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'FlashID',
      audience: 'FlashID-Users',
    })

    const sub = payload['sub'] as string | undefined
    const role = payload['role'] as string | undefined

    if (!sub || !role) {
      return redirectToLogin(req)
    }

    const dashboardRole = DEFAULT_USER_ROLE_DASHBOARD[role as UserRole]

    if (!dashboardRole || !req.nextUrl.pathname.startsWith(dashboardRole)) {
      return NextResponse.redirect(new URL(dashboardRole ?? '/', req.url))
    }
    return NextResponse.next()
  } catch {
    return redirectToLogin(req)
  }
}

function redirectToLogin(req: NextRequest) {
  const loginUrl = new URL('/login', req.url)

  const shouldPreserveReturnTo =
    req.nextUrl.pathname === ACTIVATE_CREDENTIALS_ROUTE
  if (shouldPreserveReturnTo) {
    const requestedPath = `${req.nextUrl.pathname}${req.nextUrl.search ?? ''}`
    loginUrl.searchParams.set('returnTo', requestedPath)
  }

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/citizen/:path*', '/officials/:path*', '/gov-admin/:path*'],
}
