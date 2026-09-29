import { AxiosError, type AxiosResponse } from 'axios'

import { EMAIL_NOT_VERIFIED, resolveLoginError } from '../login-errors'

const axiosErrorWith = (response?: Partial<AxiosResponse>) =>
  new AxiosError(
    'request failed',
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    response as AxiosResponse | undefined
  )

describe('resolveLoginError', () => {
  it('Should ask the user to verify when the API returns the verification code', () => {
    const error = axiosErrorWith({
      status: 403,
      data: { code: EMAIL_NOT_VERIFIED },
    })
    expect(resolveLoginError(error)).toBe(
      'Please verify your email address to continue.'
    )
  })
  it('Should prefer the verification message over the 401 message', () => {
    const error = axiosErrorWith({
      status: 401,
      data: { code: EMAIL_NOT_VERIFIED },
    })
    expect(resolveLoginError(error)).toBe(
      'Please verify your email address to continue.'
    )
  })
  it('Should report bad credentials as 401', () => {
    expect(resolveLoginError(axiosErrorWith({ status: 401, data: {} }))).toBe(
      'Incorrect email or password.'
    )
  })
  it('Should report a connectivity problem when there is no reponse', () => {
    expect(resolveLoginError(axiosErrorWith(undefined))).toBe(
      'Could not reach the server. Check your connection.'
    )
  })
  it('Should fall back to a generic message for other API failures', () => {
    expect(resolveLoginError(axiosErrorWith({ status: 500, data: {} }))).toBe(
      'Something went wrong. Please try again.'
    )
  })
  it('Should fall back to generic message for no axios errors', () => {
    expect(resolveLoginError(new Error('boom'))).toBe(
      'Something went wrong. Please try again.'
    )
  })
})
