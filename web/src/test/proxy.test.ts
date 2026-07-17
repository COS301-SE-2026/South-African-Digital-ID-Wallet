import { TextEncoder } from 'util'
;(global as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder =
  TextEncoder

jest.mock(
  'next/server',
  () =>
    ({
      NextRequest: class MockNextRequest {
        url: string
        nextUrl: { pathname: string }
        cookies: { get: (name: string) => { value: string } | undefined }

        constructor(url: string, init?: { headers?: Record<string, string> }) {
          this.url = url
          this.nextUrl = { pathname: new URL(url).pathname }
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
          },
        })),
        next: jest.fn(() => ({ status: 200, headers: { get: () => null } })),
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

  it('redirects to / when access_token cookie is not present at the moment', async () => {
    const res = await proxy(makeReq('/citizen/dashboard'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/')
  })

  it('redirect to / when JWT_SECRET env is not set yet', async () => {
    delete process.env.JWT_SECRET
    const res = await proxy(makeReq('/citizen/dashboard', 'any.token'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/')
  })

  it('redirect to / when JWT signature is not valid', async () => {
    mockJwtVerify.mockRejectedValue(new Error('signature verification failed'))
    const res = await proxy(makeReq('/citizen/dashboard', 'bad.sig.token'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/')
  })

  it('redirect to / when token is not there with the sub claim', async () => {
    mockPayload({ role: 'Citizen' })
    const res = await proxy(makeReq('/citizen/dashboard', 'valid.token'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/')
  })

  it('redirect to / when token is not there with the role claim', async () => {
    mockPayload({ sub: 'user-one-two-three' })
    const res = await proxy(makeReq('/citizen/dashboard', 'valid.token'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/')
  })

  it('redirect to / when the rols is unknown', async () => {
    mockPayload({ sub: 'user-one-two-three', role: 'SuperAdmin' })
    const res = await proxy(makeReq('/citizen/dashboard', 'valid.token'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/')
  })

  it('Citizen redirects from /officials path back to /citizen', async () => {
    mockPayload({ sub: 'user-one-two-three', role: 'Citizen' })
    const res = await proxy(makeReq('/officals/onboard-citizen', 'valid.token'))
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
})
