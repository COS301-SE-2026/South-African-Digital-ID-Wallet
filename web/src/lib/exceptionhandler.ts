import axios from 'axios'
import toast from 'react-hot-toast'
import { ProblemDetails } from '@/types'

function isProblemDetails(value: unknown): value is ProblemDetails {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('detail' in value || 'title' in value || 'status' in value)
  )
}

export function handleApiError(error: unknown) {
  let problem: ProblemDetails | undefined

  if (axios.isAxiosError<ProblemDetails>(error)) {
    problem = error.response?.data
  } else if (isProblemDetails(error)) {
    problem = error
  }

  if (!problem) {
    toast.error('An unexpected error occurred.')
    return
  }

  toast.error(
    problem.detail ??
      problem.message ??
      problem.title ??
      'Something went wrong, please try again.'
  )
}
