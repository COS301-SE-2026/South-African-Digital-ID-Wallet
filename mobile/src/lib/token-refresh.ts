import axios, {
  isAxiosError,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'

import api, { API_BASE_URL } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'

type RefreshResponse = {
  expiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
  token: string
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

const REFRESH_PATH = '/api/auth/refresh'
const SKIPPED_PATHS = [
  '/api/auth/login',
  '/api/auth/verify-device',
  REFRESH_PATH,
]
const SESSION_REJECTED_STATUSES = new Set([400, 401, 403])

let inFlight: Promise<string> | null = null
let ejectId: number | null = null

const requestNewTokens = async () => {
  const { refreshToken } = useAuthStore.getState()
  if (!refreshToken) {
    throw new Error('No refresh token is stored.')
  }
  const { data } = await axios.post<RefreshResponse>(
    `${API_BASE_URL}${REFRESH_PATH}`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json', 'X-Client': 'mobile' } }
  )
  useAuthStore.getState().replaceToken(data.token, data.expiresAt, {
    refreshToken: data.refreshToken,
    refreshTokenExpiresAt: data.refreshTokenExpiresAt,
  })
  return data.token
}

export const refreshSession = () => {
  inFlight ??= requestNewTokens().finally(() => {
    inFlight = null
  })
  return inFlight
}

export const isSessionRejected = (error: unknown) =>
  isAxiosError(error) &&
  error.response !== undefined &&
  SESSION_REJECTED_STATUSES.has(error.response.status)

const shouldRefresh = (error: AxiosError, config?: RetriableConfig) =>
  error.response?.status === 401 &&
  config !== undefined &&
  !config._retried &&
  !SKIPPED_PATHS.some((path) => config.url?.endsWith(path)) &&
  Boolean(useAuthStore.getState().refreshToken)

export const installTokenRefresh = (onSessionExpired: () => void) => {
  if (ejectId !== null) {
    api.interceptors.response.eject(ejectId)
  }
  ejectId = api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetriableConfig | undefined
      if (!config || !shouldRefresh(error, config)) {
        throw error
      }
      config._retried = true
      let token: string
      try {
        token = await refreshSession()
      } catch (refreshError) {
        if (!isSessionRejected(refreshError)) {
          throw refreshError
        }
        onSessionExpired()
        throw error
      }
      config.headers.set('Authorization', `Bearer ${token}`)
      return api.request(config)
    }
  )
}
