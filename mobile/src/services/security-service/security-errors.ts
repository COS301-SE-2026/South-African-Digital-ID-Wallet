import { isAxiosError } from 'axios'

const STEP_UP_FAILED = 'STEP_UP_FAILED'

const resolveSecurityError = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    const status = error.response?.status
    const code = (error.response?.data as { code?: string } | undefined)?.code
    if (status === 401 && code === STEP_UP_FAILED) {
      return 'That password is not correct.'
    }
    if (status === 409) {
      return 'This alert has already been handled.'
    }
    if (status === 404) {
      return 'We could not find this alert.'
    }
    if (!error.response) {
      return 'Could not reach the server. Check your connection.'
    }
  }
  return fallback
}

export const resolveSecureAccountError = (error: unknown): string =>
  resolveSecurityError(
    error,
    'Could not secure your account. Please try again.'
  )

export const resolveDismissAlertError = (error: unknown): string =>
  resolveSecurityError(
    error,
    'Could not confirm this activity. Please try again.'
  )

export const resolveSettingsError = (error: unknown): string =>
  resolveSecurityError(
    error,
    'Could not update your security settings. Please try again.'
  )
