import { isAxiosError, type AxiosError } from 'axios'

export const resolvePasswordError = (error: unknown): string => {
  if (isAxiosError(error)) {
    if (error.response?.status === 400) {
      return 'Check your current password and try again.'
    }
    if (!error.response) {
      return 'Could not reach the server. Check your connection.'
    }
  }
  return 'Could not update your password. Please try again.'
}

const serverMessage = (error: AxiosError): string | undefined =>
  (error.response?.data as { error?: string } | undefined)?.error

export const resolveEmailChangeError = (error: unknown): string => {
  if (isAxiosError(error)) {
    const status = error.response?.status
    if (status === 422) {
      return 'That password is not correct.'
    }
    if (status === 423) {
      return 'Too many attempts. Try again later.'
    }
    if (status === 403) {
      return 'Confirm your password again to continue.'
    }
    if (status === 409) {
      return 'That email address is already in use.'
    }
    if (status === 400) {
      return serverMessage(error) ?? 'Check the code and try again.'
    }
    if (!error.response) {
      return 'Could not reach the server. Check your connection.'
    }
  }
  return 'Something went wrong. Please try again.'
}

export const isReauthRequired = (error: unknown): boolean => {
  if (!isAxiosError(error)) {
    return false
  }
  const data = error.response?.data as { code?: string } | undefined
  return error.response?.status === 403 || data?.code === 'REAUTH_REQUIRED'
}
