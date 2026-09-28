import { AxiosError, type AxiosResponse } from 'axios'

import {
  isReauthRequired,
  resolveEmailChangeError,
  resolvePasswordError,
} from '../profile-errors'

const axiosErrorWith = (status: number | undefined, data: unknown = {}) =>
  new AxiosError(
    'failed',
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    status === undefined ? undefined : ({ status, data } as AxiosResponse)
  )

describe('resolvePasswordError', () => {
  it('Should ask the user to recheck their current password on 400', () => {
    expect(resolvePasswordError(axiosErrorWith(400))).toBe(
      'Check your current password and try again.'
    )
  })
  it('Should report a connection problem when there is no response', () => {
    expect(resolvePasswordError(axiosErrorWith(undefined))).toBe(
      'Could not reach the server. Check your connection.'
    )
  })
  it('Should fall back for an unmapped status', () => {
    expect(resolvePasswordError(axiosErrorWith(500))).toBe(
      'Could not update your password. Please try again.'
    )
  })
  it('Should fall back for a non-axios error', () => {
    expect(resolvePasswordError(new Error('boom'))).toBe(
      'Could not update your password. Please try again.'
    )
  })
})

describe('resolveEmailChangeError', () => {
  it.each([
    [422, 'That password is not correct.'],
    [423, 'Too many attempts. Try again later.'],
    [403, 'Confirm your password again to continue.'],
    [409, 'That email address is already in use.'],
  ])('Should map status %s to its message', (status, expected) => {
    expect(resolveEmailChangeError(axiosErrorWith(status as number))).toBe(
      expected
    )
  })
  it('Should prefer the server message on 400', () => {
    expect(
      resolveEmailChangeError(axiosErrorWith(400, { error: 'Code expired.' }))
    ).toBe('Code expired.')
  })
  it('Should fall back to a generic 400 message when the server sends none', () => {
    expect(resolveEmailChangeError(axiosErrorWith(400))).toBe(
      'Check the code and try again.'
    )
  })
  it('Should report a connection problem when there is no response', () => {
    expect(resolveEmailChangeError(axiosErrorWith(undefined))).toBe(
      'Could not reach the server. Check your connection.'
    )
  })
  it('Should fall back for an unmapped status', () => {
    expect(resolveEmailChangeError(axiosErrorWith(500))).toBe(
      'Something went wrong. Please try again.'
    )
  })
  it('Should fall back for a non-axios error', () => {
    expect(resolveEmailChangeError(new Error('boom'))).toBe(
      'Something went wrong. Please try again.'
    )
  })
})

describe('isReauthRequired', () => {
  it('Should be true for a 403', () => {
    expect(isReauthRequired(axiosErrorWith(403))).toBe(true)
  })
  it('Should be true for the REAUTH_REQUIRED code on any status', () => {
    expect(
      isReauthRequired(axiosErrorWith(400, { code: 'REAUTH_REQUIRED' }))
    ).toBe(true)
  })
  it('Should be false for an unrelated axios error', () => {
    expect(isReauthRequired(axiosErrorWith(409))).toBe(false)
  })
  it('Should be false for a non-axios error', () => {
    expect(isReauthRequired(new Error('boom'))).toBe(false)
  })
})
