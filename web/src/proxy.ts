import { jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

import { DEFAULT_USER_ROLE_DASHBOARD, type UserRole } from '@/types/roles'

export async function proxy(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'FlashID',
      audience: 'FlashID-Users',
    })

    const role = payload['role'] as string
    const dashboardRole = DEFAULT_USER_ROLE_DASHBOARD[role as UserRole]

    if (!dashboardRole || !req.nextUrl.pathname.startsWith(dashboardRole)) {
      return NextResponse.redirect(new URL(dashboardRole ?? '/', req.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/citizen/:path*', '/officials/:path*', '/gov-admin/:path*'],
}
