import { isAxiosError } from 'axios'

// Matches StepUpVerificationFailedException.ErrorCode on the backend
const STEP_UP_FAILED = 'STEP_UP_FAILED'

export const resolveSecureAccountError = (error: unknown): string => {
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
  return 'Could not secure your account. Please try again.'
}
