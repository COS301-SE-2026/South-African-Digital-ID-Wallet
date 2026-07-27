import axios from 'axios'
import { Platform } from 'react-native'

const fallbackBaseUrl =
  Platform.OS === 'android' ? 'http://10.0.2.2:5118' : 'http://localhost:5118'

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? fallbackBaseUrl

const api = axios.create({
  baseURL: API_BASE_URL,
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
