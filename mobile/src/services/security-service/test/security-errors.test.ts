import { AxiosError } from 'axios'
import type { AxiosResponse } from 'axios'

import {
  resolveDismissAlertError,
  resolveSecureAccountError,
  resolveSettingsError,
} from '@/services/security-service/security-errors'

const httpError = (status: number, data: unknown = {}) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data,
    status,
  } as AxiosResponse)

const networkError = () => new AxiosError('Network Error', 'ERR_NETWORK')

describe('security-errors', () => {
  it('Should report a wrong password when step-up verification fails', () => {
    expect(
      resolveSecureAccountError(httpError(401, { code: 'STEP_UP_FAILED' }))
    ).toBe('That password is not correct.')
  })

  it('Should fall back when a 401 is not a step-up failure', () => {
    expect(resolveSecureAccountError(httpError(401))).toBe(
      'Could not secure your account. Please try again.'
    )
  })

  it('Should explain that a resolved alert was already handled', () => {
    expect(resolveDismissAlertError(httpError(409))).toBe(
      'This alert has already been handled.'
    )
  })

  it('Should explain that a missing alert could not be found', () => {
    expect(resolveSecureAccountError(httpError(404))).toBe(
      'We could not find this alert.'
    )
  })

  it('Should point to the connection when there is no response', () => {
    expect(resolveSettingsError(networkError())).toBe(
      'Could not reach the server. Check your connection.'
    )
  })

  it('Should use each action fallback for unexpected errors', () => {
    const error = new Error('boom')
    expect(resolveSecureAccountError(error)).toBe(
      'Could not secure your account. Please try again.'
    )
    expect(resolveDismissAlertError(error)).toBe(
      'Could not confirm this activity. Please try again.'
    )
    expect(resolveSettingsError(error)).toBe(
      'Could not update your security settings. Please try again.'
    )
  })

  it('Should fall back for a server error', () => {
    expect(resolveSettingsError(httpError(500))).toBe(
      'Could not update your security settings. Please try again.'
    )
  })
})
