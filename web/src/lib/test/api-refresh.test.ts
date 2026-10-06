type RefreshHandler = (value: unknown) => Promise<unknown>

const visitPath = (pathname: string) =>
  window.history.pushState({}, '', pathname)

const loadApi = async () => {
  const api = (await import('@/lib/api')).default
  const response = api.interceptors.response as unknown as {
    handlers: { rejected: RefreshHandler }[]
  }
  const post = jest.spyOn(api, 'post')
  const request = jest
    .spyOn(api, 'request')
    .mockResolvedValue({ data: 'retried' })
  return { post, reject: response.handlers[0].rejected, request }
}

const unauthorized = (url = '/api/credentials') => ({
  config: { headers: {}, url },
  response: { status: 401 },
})

describe('api session refresh', () => {
  beforeEach(() => {
    jest.resetModules()
    window.localStorage.clear()
    window.localStorage.setItem('flashid-user', '{"userId":"u-1"}')
    visitPath('/citizen/my-credentials')
  })

  it('Should refresh the session and retry the request', async () => {
    const { post, reject, request } = await loadApi()
    post.mockResolvedValue({ data: {} })
    const error = unauthorized()

    await expect(reject(error)).resolves.toEqual({ data: 'retried' })

    expect(post).toHaveBeenCalledWith('/api/auth/refresh')
    expect(request).toHaveBeenCalledWith(error.config)
    expect(window.localStorage.getItem('flashid-user')).not.toBeNull()
  })

  it('Should extend the stored session expiry after a refresh', async () => {
    const { post, reject } = await loadApi()
    post.mockResolvedValue({
      data: { refreshTokenExpiresAt: '2026-02-01T00:00:00Z' },
    })

    await reject(unauthorized())

    expect(window.localStorage.getItem('flashid-session-expires-at')).toBe(
      '2026-02-01T00:00:00Z'
    )
  })

  it('Should share one refresh between parallel failures', async () => {
    const { post, reject } = await loadApi()
    post.mockResolvedValue({ data: {} })

    await Promise.all([reject(unauthorized()), reject(unauthorized())])

    expect(post).toHaveBeenCalledTimes(1)
  })

  it('Should retry when another tab already rotated the session', async () => {
    const { post, reject, request } = await loadApi()
    post.mockRejectedValue({ response: { status: 409 } })

    await expect(reject(unauthorized())).resolves.toEqual({ data: 'retried' })

    expect(request).toHaveBeenCalledTimes(1)
  })

  it('Should clear the session when the refresh is rejected', async () => {
    const { post, reject, request } = await loadApi()
    post.mockRejectedValue({ response: { status: 401 } })

    await expect(reject(unauthorized())).rejects.toBeDefined()

    expect(request).not.toHaveBeenCalled()
    expect(window.localStorage.getItem('flashid-user')).toBeNull()
  })

  it.each([
    ['a server error', { response: { status: 500 } }],
    ['rate limiting', { response: { status: 429 } }],
    ['a network failure', new Error('Network Error')],
  ])(
    'Should keep the session when the refresh fails with %s',
    async (_, refreshError) => {
      const { post, reject, request } = await loadApi()
      post.mockRejectedValue(refreshError)
      const error = unauthorized()

      await expect(reject(error)).rejects.toBe(error)

      expect(request).not.toHaveBeenCalled()
      expect(window.localStorage.getItem('flashid-user')).not.toBeNull()
    }
  )

  it('Should keep the session when the retried request fails for another reason', async () => {
    const { post, reject, request } = await loadApi()
    post.mockResolvedValue({ data: {} })
    const forbidden = { response: { status: 403 } }
    request.mockRejectedValue(forbidden)

    await expect(reject(unauthorized())).rejects.toBe(forbidden)

    expect(window.localStorage.getItem('flashid-user')).not.toBeNull()
  })

  it('Should not refresh a failed login', async () => {
    const { post, reject } = await loadApi()

    await expect(reject(unauthorized('/api/auth/login'))).rejects.toBeDefined()

    expect(post).not.toHaveBeenCalled()
  })

  it('Should not refresh a request that was already retried', async () => {
    const { post, reject } = await loadApi()
    const error = unauthorized()
    Object.assign(error.config, { _retried: true })

    await expect(reject(error)).rejects.toBeDefined()

    expect(post).not.toHaveBeenCalled()
  })
})
