import { isAxiosError } from 'axios'

export const resolveRegisterError = (error: unknown): string => {
  if (isAxiosError(error)) {
    const message = error.response?.data?.error
    if (typeof message === 'string' && message.length > 0) {
      return message
    }
    if (error.response?.status === 409) {
      return 'An account with this email already exists.'
    }
    if (error.response?.status === 429) {
      return 'Too many attempts. Please wait a minute and try again.'
    }
    if (!error.response) {
      return 'Could not reach the server. Check your connection.'
    }
  }
  return 'Something went wrong. Please try again.'
}
