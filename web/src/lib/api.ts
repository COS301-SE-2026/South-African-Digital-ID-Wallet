import axios from 'axios'

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  // Send cookies (httpOnly) with requests for authentication
  withCredentials: true,
})
function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/)
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

// Guard to ensure multiple simultaneous 401 failures only trigger one redirect
let isRedirectingToLogin = false

const handleUnauthorized = () => {
  if (isRedirectingToLogin) return
  isRedirectingToLogin = true
  window.localStorage.removeItem('flashid-session-expires-at')
  window.localStorage.removeItem('flashid-user')
  window.sessionStorage.removeItem('flashid-user')
  window.location.href = '/'
}

// If the session expires or is invalid, clear any stale local user data and redirect to login so the user isn't stuck seeing broken pages.
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
