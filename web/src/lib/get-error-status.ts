import axios from 'axios'

export const getErrorStatus = (error: unknown): number | undefined => {
  if (axios.isAxiosError(error)) {
    return error.response?.status
  }
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const { status } = error as { status: unknown }
    return typeof status === 'number' ? status : undefined
  }
  return undefined
}
