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

export default api
