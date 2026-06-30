import axios from 'axios'

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5118'

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  // Send cookies (httpOnly) with requests for authentication
  withCredentials: true,
})

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
      window.localStorage.clear()
      window.sessionStorage.clear()
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api
