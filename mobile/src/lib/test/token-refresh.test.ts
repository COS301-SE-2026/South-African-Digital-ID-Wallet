import axios, { AxiosError, AxiosHeaders } from 'axios'

import api from '@/lib/api'
import { installTokenRefresh } from '@/lib/token-refresh'
import { useAuthStore } from '@/stores/auth-store'

jest.mock('@/lib/secure-session', () => ({
  clearSession: jest.fn().mockResolvedValue(undefined),
  getBiometricPreference: jest.fn().mockResolvedValue(true),
  loadSession: jest.fn(),
  saveSession: jest.fn().mockResolvedValue(undefined),
  setBiometricPreference: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/device-identity', () => ({
  loadDeviceToken: jest.fn().mockResolvedValue(null),
  saveDeviceToken: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/services/offline-service', () => ({
  offlineService: { clearOfflineData: jest.fn().mockResolvedValue(undefined) },
}))

type RejectHandler = (error: unknown) => Promise<unknown>

const rejectHandler = (): RejectHandler => {
  const interceptors = api.interceptors.response as unknown as {
    handlers: ({ rejected: RejectHandler } | null)[]
  }
  return interceptors.handlers.filter(Boolean).at(-1)!.rejected
}

const unauthorized = (url = '/api/credentials') => {
  const config = { headers: new AxiosHeaders(), url }
  return new AxiosError('Unauthorized', '401', config as never, null, {
    config,
    data: {},
    headers: {},
    status: 401,
    statusText: 'Unauthorized',
  } as never)
}

const rejectedRefresh = (status: number) =>
  new AxiosError('rejected', String(status), undefined, null, {
    data: {},
    headers: {},
    status,
    statusText: '',
  } as never)

const pristine = useAuthStore.getState()
const onSessionExpired = jest.fn()

const signIn = (refreshToken: string | null = 'refresh-1') =>
  useAuthStore.getState().signIn({
    expiresAt: '2099-01-01T00:00:00Z',
    names: 'Thabo',
    refreshToken,
    refreshTokenExpiresAt: '2099-02-01T00:00:00Z',
    role: 'citizen',
    surname: 'Mokoena',
    token: 'expired-jwt',
    userId: 'u-1',
  })

describe('token refresh interceptor', () => {
  let post: jest.SpyInstance
  let retry: jest.SpyInstance

  beforeEach(() => {
    useAuthStore.setState(pristine, true)
    jest.clearAllMocks()
    post = jest.spyOn(axios, 'post')
    retry = jest
      .spyOn(api, 'request')
      .mockResolvedValue({ data: 'retried' } as never)
    installTokenRefresh(onSessionExpired)
  })

  afterEach(() => jest.restoreAllMocks())

  it('Should refresh the tokens and retry the request once', async () => {
    signIn()
    post.mockResolvedValue({
      data: {
        expiresAt: '2099-01-01T00:15:00Z',
        refreshToken: 'refresh-2',
        refreshTokenExpiresAt: '2099-03-01T00:00:00Z',
        token: 'fresh-jwt',
      },
    })

    const error = unauthorized()
    await expect(rejectHandler()(error)).resolves.toEqual({ data: 'retried' })

    expect(post).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/refresh'),
      { refreshToken: 'refresh-1' },
      expect.anything()
    )
    expect(useAuthStore.getState()).toMatchObject({
      refreshToken: 'refresh-2',
      refreshTokenExpiresAt: '2099-03-01T00:00:00Z',
      token: 'fresh-jwt',
    })
    expect(error.config?.headers.get('Authorization')).toBe('Bearer fresh-jwt')
    expect(retry).toHaveBeenCalledWith(error.config)
  })

  it('Should share one refresh between parallel failures', async () => {
    signIn()
    post.mockResolvedValue({
      data: {
        expiresAt: '2099-01-01T00:15:00Z',
        refreshToken: 'refresh-2',
        refreshTokenExpiresAt: '2099-03-01T00:00:00Z',
        token: 'fresh-jwt',
      },
    })

    const handler = rejectHandler()
    await Promise.all([
      handler(unauthorized()).catch(() => {}),
      handler(unauthorized()).catch(() => {}),
    ])

    expect(post).toHaveBeenCalledTimes(1)
  })

  it('Should sign out when the backend rejects the refresh token', async () => {
    signIn()
    post.mockRejectedValue(rejectedRefresh(401))

    await expect(rejectHandler()(unauthorized())).rejects.toBeDefined()

    expect(onSessionExpired).toHaveBeenCalledTimes(1)
    expect(retry).not.toHaveBeenCalled()
  })

  it('Should keep the session when the refresh fails offline', async () => {
    signIn()
    post.mockRejectedValue(new AxiosError('Network Error'))

    await expect(rejectHandler()(unauthorized())).rejects.toBeDefined()

    expect(onSessionExpired).not.toHaveBeenCalled()
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('Should not refresh without a stored refresh token', async () => {
    signIn(null)

    await expect(rejectHandler()(unauthorized())).rejects.toBeDefined()

    expect(post).not.toHaveBeenCalled()
  })

  it('Should not refresh a failed login', async () => {
    signIn()

    await expect(
      rejectHandler()(unauthorized('/api/auth/login'))
    ).rejects.toBeDefined()

    expect(post).not.toHaveBeenCalled()
  })

  it('Should pass through errors that are not 401', async () => {
    signIn()
    const error = rejectedRefresh(500)

    await expect(rejectHandler()(error)).rejects.toBe(error)

    expect(post).not.toHaveBeenCalled()
  })
})
