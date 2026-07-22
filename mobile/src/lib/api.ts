import axios from 'axios'
import Constants from 'expo-constants'

const apiBaseUrl =
  Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:5118'

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export default api
