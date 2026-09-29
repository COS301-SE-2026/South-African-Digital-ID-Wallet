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
    if (status === 404) {
      return 'No emergency profile is available. This person has not set one up, or has switched it off.'
    }
    if (status === 409) {
      return 'This phone is not registered for emergency access.'
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
