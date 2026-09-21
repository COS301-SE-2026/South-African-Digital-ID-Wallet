import { isAxiosError } from 'axios'

export const resolveEmergencyError = (error: unknown): string => {
  if (isAxiosError(error)) {
    const status = error.response?.status
    if (status === 400) {
      return 'This emergency code is not valid. It may have expired — ask for a fresh one.'
    }
    if (status === 401 || status === 403) {
      return 'Your account is not authorised to open emergency profiles.'
    }
    if (status === 429) {
      return 'Too many attempts. Wait a minute before scanning again.'
    }
    if (!error.response) {
      return 'Could not reach the server. Use the offline code if there is no signal.'
    }
  }
  return 'Something went wrong. Please try again.'
}
