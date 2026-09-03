import { isAxiosError } from 'axios'

export const resolveScanError = (error: unknown): string => {
  if (isAxiosError(error)) {
    if (error.response?.status === 400) {
      return 'This QR code is invalid, expired, or has already been used.'
    }
    if (!error.response) {
      return 'Could not reach the server. Check your connection.'
    }
  }
  return 'Something went wrong. Please try again.'
}
