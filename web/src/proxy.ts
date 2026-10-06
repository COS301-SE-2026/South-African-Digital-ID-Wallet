import { jwtVerify, type JWTPayload } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

import { DEFAULT_USER_ROLE_DASHBOARD, type UserRole } from '@/types/roles'

const ACTIVATE_CREDENTIALS_ROUTE = '/citizen/activate-credentials'
const ACCESS_TOKEN_COOKIE = 'access_token'
const REFRESH_TOKEN_COOKIE = 'refresh_token'
const FORWARDED_HEADERS = ['user-agent', 'x-forwarded-for', 'x-forwarded-proto']

type RefreshResult = {
  accessToken: string | null
  rotatedElsewhere: boolean
  setCookies: string[]
}

export async function proxy(req: NextRequest) {
  const jwtSecret = process.env.JWT_SECRET
  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value

  if (!jwtSecret) {
    return redirectToLogin(req)
  }

  const payload = token ? await verifyToken(token, jwtSecret) : null
  if (payload) {
    return routeByRole(req, payload)
  }

  const refreshed = await refreshSession(req)
  if (!refreshed) {
    return redirectToLogin(req)
  }

  if (refreshed.rotatedElsewhere) {
    return NextResponse.next()
  }

  const refreshedPayload = refreshed.accessToken
    ? await verifyToken(refreshed.accessToken, jwtSecret)
    : null
  const response = refreshedPayload
    ? routeByRole(req, refreshedPayload)
    : redirectToLogin(req)
  refreshed.setCookies.forEach((cookie) =>
    response.headers.append('set-cookie', cookie)
  )
  return response
}

async function verifyToken(token: string, jwtSecret: string) {
  try {
    const secret = new TextEncoder().encode(jwtSecret)
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'FlashID',
      audience: 'FlashID-Users',
    })
    return payload
  } catch {
    return null
  }
}

function routeByRole(req: NextRequest, payload: JWTPayload) {
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
}

async function refreshSession(req: NextRequest): Promise<RefreshResult | null> {
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value
  if (!refreshToken) {
    return null
  }

  const headers = new Headers({
    cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}`,
  })
  FORWARDED_HEADERS.forEach((name) => {
    const value = req.headers.get(name)
    if (value) headers.set(name, value)
  })

  try {
    const apiUrl = process.env.API_INTERNAL_URL ?? 'http://localhost:5118'
    const refreshUrl = new URL('/api/auth/refresh', apiUrl).toString()
    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers,
      cache: 'no-store',
    })
    const setCookies = response.headers.getSetCookie()
    return {
      accessToken: response.ok
        ? readCookie(setCookies, ACCESS_TOKEN_COOKIE)
        : null,
      rotatedElsewhere: response.status === 409,
      setCookies,
    }
  } catch {
    return null
  }
}

function readCookie(setCookies: string[], name: string) {
  const cookie = setCookies.find((value) => value.startsWith(`${name}=`))
  const token = cookie?.split(';')[0].slice(name.length + 1)
  return token ? decodeURIComponent(token) : null
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
