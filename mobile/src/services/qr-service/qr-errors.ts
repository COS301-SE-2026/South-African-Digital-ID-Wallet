import { isAxiosError } from 'axios'

export const resolveQrError = (error: unknown): string => {
  if (isAxiosError(error)) {
    if (error.response?.status === 404 || error.response?.status === 403) {
      return 'We could not find that credential in your wallet.'
    }
    if (error.response?.status === 400) {
      return 'This credential is not active, so it cannot be shared.'
    }
    if (!error.response) {
      return 'Could not reach the server. Check your connection.'
    }
  }
  return 'Could not generate your QR code. Please try again.'
}
