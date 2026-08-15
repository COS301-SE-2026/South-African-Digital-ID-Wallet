import { isAxiosError } from 'axios'

export const EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED'

export const resolveLoginError = (error: unknown): string => {
  if (isAxiosError(error)) {
    if (error.response?.data?.code === EMAIL_NOT_VERIFIED) {
      return 'Please verify your email address to continue.'
    }
    if (error.response?.status === 401) {
      return 'Incorrect email or password.'
    }
    if (!error.response) {
      return 'Could not reach the server. Check your connection.'
    }
  }
  return 'Something went wrong. Please try again.'
}
