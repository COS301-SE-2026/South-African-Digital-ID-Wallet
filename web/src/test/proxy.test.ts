import { TextEncoder } from 'util'
;(global as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder =
  TextEncoder

jest.mock(
  'next/server',
  () =>
    ({
      NextRequest: class MockNextRequest {
        url: string
        nextUrl: { pathname: string; search: string }
        cookies: { get: (name: string) => { value: string } | undefined }
        headers: Headers

        constructor(url: string, init?: { headers?: Record<string, string> }) {
          this.url = url
          this.headers = new Headers(init?.headers)
          const parsedUrl = new URL(url)
          this.nextUrl = {
            pathname: parsedUrl.pathname,
            search: parsedUrl.search,
          }
          const cookieStr = (init?.headers ?? {})['cookie'] ?? ''
          const jar: Record<string, string> = {}
          cookieStr.split(';').forEach((pair: string) => {
            const eq = pair.indexOf('=')
            if (eq !== -1) {
              jar[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim()
            }
          })
          this.cookies = {
            get: (name: string) =>
              name in jar ? { value: jar[name] } : undefined,
          }
        }
      },
      NextResponse: {
        redirect: jest.fn((url: URL) => ({
          status: 307,
          headers: {
            get: (h: string) => (h === 'location' ? url.toString() : null),
            append: jest.fn(),
          },
        })),
        next: jest.fn(() => ({
          status: 200,
          headers: { get: () => null, append: jest.fn() },
        })),
      },
    }) as unknown
)

jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}))

import { proxy } from '@/proxy'
import { jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

const mockJwtVerify = jwtVerify as jest.MockedFunction<typeof jwtVerify>

function makeReq(path: string, token?: string): NextRequest {
  const headers: Record<string, string> = {}
  if (token) {
    headers['cookie'] = `access_token=${token}`
  }
  return new NextRequest(`http://localhost${path}`, { headers })
}

function mockPayload(payload: Record<string, unknown>) {
  mockJwtVerify.mockResolvedValue({
    payload,
    protectedHeader: { alg: 'HS256' },
  } as unknown as Awaited<ReturnType<typeof jwtVerify>>)
}

describe('proxy middleware', () => {
  const savedEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...savedEnv, JWT_SECRET: 'test-secret' }
  })

  afterEach(() => {
    process.env = savedEnv
  })

  it('redirects to login when access_token cookie is not present at the moment', async () => {
    const res = await proxy(makeReq('/citizen/dashboard'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/login')
  })

  it('redirect to login when JWT_SECRET is not set yet', async () => {
    delete process.env.JWT_SECRET
    const res = await proxy(makeReq('/citizen/dashboard', 'any.token'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/login')
  })

  it('redirect to login when JWT signature is not valid', async () => {
    mockJwtVerify.mockRejectedValue(new Error('signature verification failed'))
    const res = await proxy(makeReq('/citizen/dashboard', 'bad.sig.token'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/login')
  })

  it('redirect to login when token is not there with the sub claim', async () => {
    mockPayload({ role: 'Citizen' })
    const res = await proxy(makeReq('/citizen/dashboard', 'valid.token'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/login')
  })

  it('redirect to login when token is not there with the role claim', async () => {
    mockPayload({ sub: 'user-one-two-three' })
    const res = await proxy(makeReq('/citizen/dashboard', 'valid.token'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/login')
  })

  it('redirect to home when the role is unknown', async () => {
    mockPayload({ sub: 'user-one-two-three', role: 'SuperAdmin' })
    const res = await proxy(makeReq('/citizen/dashboard', 'valid.token'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/')
  })

  it('Citizen redirects from /officials path back to /citizen', async () => {
    mockPayload({ sub: 'user-one-two-three', role: 'Citizen' })
    const res = await proxy(
      makeReq('/officials/onboard-citizen', 'valid.token')
    )
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/citizen')
  })

  it('Official redirects from /citizen path back to /officials', async () => {
    mockPayload({ sub: 'user-one-two-three', role: 'Official' })
    const res = await proxy(makeReq('/citizen/dashboard', 'valid.token'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/officials')
  })

  it('Gov-Admin redirects from /citizen path back to /gov-admin', async () => {
    mockPayload({ sub: 'user-one-two-three', role: 'GovernmentAdministrator' })
    const res = await proxy(makeReq('/citizen/dashboard', 'valid.token'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/gov-admin')
  })

  it('Citizen correct path to /citizen', async () => {
    mockPayload({ sub: 'user-one-two-three', role: 'Citizen' })
    const res = await proxy(makeReq('/citizen/dashboard', 'valid.token'))
    expect(res.status).toBe(200)
  })

  it('Official correct path to /officials', async () => {
    mockPayload({ sub: 'user-one-two-three', role: 'Official' })
    const res = await proxy(
      makeReq('/officials/onboard-citizen', 'valid.token')
    )
    expect(res.status).toBe(200)
  })

  it('preserves returnTo for the activate credentials route', async () => {
    const res = await proxy(
      makeReq('/citizen/activate-credentials?token=abc123')
    )
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(
      'http://localhost/login?returnTo=%2Fcitizen%2Factivate-credentials%3Ftoken%3Dabc123'
    )
  })

  describe('when the access token has expired', () => {
    const fetchMock = jest.fn()
    const savedFetch = global.fetch

    const refreshResponse = (ok: boolean, setCookies: string[]) => ({
      ok,
      headers: { getSetCookie: () => setCookies },
    })

    const makeRefreshReq = (path: string, accessToken?: string) => {
      const cookies = ['refresh_token=refresh-1']
      if (accessToken) cookies.push(`access_token=${accessToken}`)
      return new NextRequest(`http://localhost${path}`, {
        headers: { cookie: cookies.join('; '), 'x-forwarded-for': '1.2.3.4' },
      })
    }

    beforeEach(() => {
      global.fetch = fetchMock as unknown as typeof fetch
      fetchMock.mockReset()
    })

    afterEach(() => {
      global.fetch = savedFetch
    })

    it('refreshes the session and forwards the new cookies', async () => {
      const setCookies = [
        'access_token=new.jwt; path=/; httponly',
        'refresh_token=refresh-2; path=/; httponly',
      ]
      fetchMock.mockResolvedValue(refreshResponse(true, setCookies))
      mockPayload({ sub: 'user-one-two-three', role: 'Citizen' })

      const res = await proxy(makeRefreshReq('/citizen/dashboard'))

      expect(res.status).toBe(200)
      expect(mockJwtVerify).toHaveBeenCalledWith(
        'new.jwt',
        expect.anything(),
        expect.anything()
      )
      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toBe('http://localhost:5118/api/auth/refresh')
      expect(init.method).toBe('POST')
      expect(init.headers.get('cookie')).toBe('refresh_token=refresh-1')
      expect(init.headers.get('x-forwarded-for')).toBe('1.2.3.4')
      const append = res.headers.append as jest.Mock
      expect(append.mock.calls).toEqual(
        setCookies.map((cookie) => ['set-cookie', cookie])
      )
    })

    it('refreshes when the access token cookie is no longer valid', async () => {
      mockJwtVerify
        .mockRejectedValueOnce(new Error('"exp" claim timestamp check failed'))
        .mockResolvedValueOnce({
          payload: { sub: 'user-one-two-three', role: 'Citizen' },
          protectedHeader: { alg: 'HS256' },
        } as unknown as Awaited<ReturnType<typeof jwtVerify>>)
      fetchMock.mockResolvedValue(
        refreshResponse(true, ['access_token=new.jwt; path=/'])
      )

      const res = await proxy(makeRefreshReq('/citizen/dashboard', 'old.jwt'))

      expect(res.status).toBe(200)
    })

    it('redirects to login and clears cookies when the refresh is rejected', async () => {
      const cleared = ['refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT']
      fetchMock.mockResolvedValue(refreshResponse(false, cleared))

      const res = await proxy(makeRefreshReq('/citizen/dashboard'))

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe('http://localhost/login')
      expect(res.headers.append).toHaveBeenCalledWith('set-cookie', cleared[0])
    })

    it('lets the request through when another request already rotated the session', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 409,
        headers: { getSetCookie: () => [] },
      })

      const res = await proxy(makeRefreshReq('/citizen/dashboard'))

      expect(res.status).toBe(200)
    })

    it('redirects to login when the api cannot be reached', async () => {
      fetchMock.mockRejectedValue(new Error('ECONNREFUSED'))

      const res = await proxy(makeRefreshReq('/citizen/dashboard'))

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe('http://localhost/login')
    })

    it('builds the refresh url when API_INTERNAL_URL ends with a slash', async () => {
      process.env.API_INTERNAL_URL = 'http://localhost:5118/'
      fetchMock.mockResolvedValue(refreshResponse(false, []))

      await proxy(makeRefreshReq('/citizen/dashboard'))

      expect(fetchMock.mock.calls[0][0]).toBe(
        'http://localhost:5118/api/auth/refresh'
      )
    })

    it('does not call the api without a refresh cookie', async () => {
      await proxy(makeReq('/citizen/dashboard'))

      expect(fetchMock).not.toHaveBeenCalled()
    })
  })
})
