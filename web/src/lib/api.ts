import axios from 'axios'

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  // Send cookies (httpOnly) with requests for authentication
  withCredentials: true,
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
