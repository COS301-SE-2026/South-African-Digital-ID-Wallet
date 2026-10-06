import axios, { type InternalAxiosRequestConfig } from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Send cookies (httpOnly) with requests for authentication
  withCredentials: true,
})
function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = /(?:^|;\s*)csrf_token=([^;]+)/.exec(document.cookie)
  return match ? decodeURIComponent(match[1]) : null
}

const CSRF_METHODS = new Set(['post', 'put', 'patch', 'delete'])

api.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase()
  if (method && CSRF_METHODS.has(method)) {
    const token = getCsrfToken()
    if (token) {
      config.headers = config.headers ?? {}
      config.headers['X-CSRF-Token'] = token
    }
  }
  return config
})

const REFRESH_PATH = '/api/auth/refresh'
const SKIPPED_REFRESH_PATHS = [
  '/api/auth/login',
  '/api/auth/verify-device',
  '/api/auth/resend-device-verification',
  REFRESH_PATH,
]

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

let refreshInFlight: Promise<void> | null = null

const SESSION_EXPIRY_KEY = 'flashid-session-expires-at'

const rememberSessionExpiry = (expiresAt?: string | null) => {
  if (expiresAt && typeof window !== 'undefined') {
    window.localStorage.setItem(SESSION_EXPIRY_KEY, expiresAt)
  }
}

export const refreshSession = () => {
  refreshInFlight ??= api
    .post<{ refreshTokenExpiresAt?: string | null }>(REFRESH_PATH)
    .then((response) => {
      rememberSessionExpiry(response?.data?.refreshTokenExpiresAt)
    })
    .finally(() => {
      refreshInFlight = null
    })
  return refreshInFlight
}

const canRefresh = (status: number | undefined, config?: RetriableConfig) =>
  status === 401 &&
  typeof window !== 'undefined' &&
  config !== undefined &&
  !config._retried &&
  !SKIPPED_REFRESH_PATHS.some((path) => config.url?.endsWith(path))

// Guard to ensure multiple simultaneous 401 failures only trigger one redirect
let isRedirectingToLogin = false

const handleUnauthorized = () => {
  if (isRedirectingToLogin) return
  isRedirectingToLogin = true
  window.localStorage.removeItem(SESSION_EXPIRY_KEY)
  window.localStorage.removeItem('flashid-user')
  window.sessionStorage.removeItem('flashid-user')
  window.location.href = '/'
}

// If the session expires or is invalid, clear any stale local user data and redirect to login so the user isn't stuck seeing broken pages.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetriableConfig | undefined
    if (config && canRefresh(error.response?.status, config)) {
      config._retried = true
      try {
        await refreshSession()
        return await api.request(config)
      } catch (refreshError) {
        const refreshStatus = (
          refreshError as { response?: { status?: number } }
        ).response?.status
        if (refreshStatus === 409) {
          return api.request(config)
        }
      }
    }
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/login') &&
      window.location.pathname !== '/'
    ) {
      handleUnauthorized()
    }
    return Promise.reject(error)
  }
)

export default api
