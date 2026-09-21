import { AxiosError, AxiosHeaders } from 'axios'

import { resolveEmergencyError } from '../emergency-errors'

const withStatus = (status: number) =>
  new AxiosError('failed', 'ERR', undefined, undefined, {
    config: { headers: new AxiosHeaders() },
    data: {},
    headers: {},
    status,
    statusText: '',
  })

describe('resolveEmergencyError', () => {
  it('Should not reveal why a code was rejected', () => {
    expect(resolveEmergencyError(withStatus(400))).toBe(
      'This emergency code is not valid. It may have expired — ask for a fresh one.'
    )
  })

  it.each([401, 403])(
    'Should explain a %s as an authorisation problem',
    (status) => {
      expect(resolveEmergencyError(withStatus(status))).toBe(
        'Your account is not authorised to open emergency profiles.'
      )
    }
  )

  it('Should explain rate limiting', () => {
    expect(resolveEmergencyError(withStatus(429))).toContain(
      'Too many attempts'
    )
  })

  it('Should suggest the offline code when the server is unreachable', () => {
    expect(resolveEmergencyError(new AxiosError('offline'))).toContain(
      'offline code'
    )
  })

  it('Should fall back for a non-axios error', () => {
    expect(resolveEmergencyError(new Error('boom'))).toBe(
      'Something went wrong. Please try again.'
    )
  })

  it('Should fall back for an unexpected status', () => {
    expect(resolveEmergencyError(withStatus(500))).toBe(
      'Something went wrong. Please try again.'
    )
  })
})
