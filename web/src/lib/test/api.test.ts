const STORAGE_KEY = 'flashid-user'
const EXPIRY_KEY = 'flashid-session-expires-at'

const setPathname = (pathname: string) =>
  window.history.pushState({}, '', pathname)

const seedSession = () => {
  window.localStorage.setItem(STORAGE_KEY, '{"userId":"u-1"}')
  window.localStorage.setItem(EXPIRY_KEY, '2030-01-01T00:00:00.000Z')
  window.sessionStorage.setItem(STORAGE_KEY, '{"userId":"u-1"}')
}

type RejectHandler = (error: unknown) => Promise<never>

const loadRejectHandler = async () => {
  const api = (await import('@/lib/api')).default
  const response = api.interceptors.response as unknown as {
    handlers: { rejected: RejectHandler }[]
  }
  return response.handlers[0].rejected
}

describe('api response interceptor', () => {
  beforeEach(() => {
    jest.resetModules()
    window.localStorage.clear()
    window.sessionStorage.clear()
    seedSession()
  })

  it('Should clear stored session data and redirects home', async () => {
    setPathname('/citizen/my-credentials')
    const reject = await loadRejectHandler()
    await expect(reject({ response: { status: 401 } })).rejects.toBeDefined()
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(window.localStorage.getItem(EXPIRY_KEY)).toBeNull()
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('Should redirect only when error', async () => {
    setPathname('/citizen')
    const reject = await loadRejectHandler()
    await expect(reject({ response: { status: 401 } })).rejects.toBeDefined()
    seedSession()
    await expect(reject({ response: { status: 401 } })).rejects.toBeDefined()
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull()
  })

  it.each(['/login', '/'])('Should not redirect away', async (pathname) => {
    setPathname(pathname)
    const reject = await loadRejectHandler()
    await expect(reject({ response: { status: 401 } })).rejects.toBeDefined()
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull()
  })

  it('Should ignore non-401 responses', async () => {
    setPathname('/citizen')
    const reject = await loadRejectHandler()
    await expect(reject({ response: { status: 500 } })).rejects.toBeDefined()
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull()
  })

  it('Should pass through error with no response', async () => {
    setPathname('/citizen')
    const reject = await loadRejectHandler()
    await expect(reject(new Error('network down'))).rejects.toThrow(
      'network down'
    )
  })
})
