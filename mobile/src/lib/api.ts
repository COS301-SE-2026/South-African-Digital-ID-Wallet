import { create } from 'axios'
import { Platform } from 'react-native'

const fallbackBaseUrl =
  Platform.OS === 'android' ? 'http://10.0.2.2:5118' : 'http://localhost:5118'

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? fallbackBaseUrl

const api = create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Client': 'mobile',
  },
})

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

let deviceToken: string | null = null

export function setDeviceToken(token: string | null) {
  deviceToken = token
}

api.interceptors.request.use((config) => {
  if (deviceToken) {
    config.headers.set('X-Device-Token', deviceToken)
  }
  return config
})

export default api
