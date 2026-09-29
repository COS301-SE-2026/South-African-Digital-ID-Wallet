import { AxiosHeaders } from 'axios'

import api, { API_BASE_URL, setAuthToken, setDeviceToken } from '../api'

type RequestInterceptors = {
  handlers: {
    fulfilled: (config: { headers: AxiosHeaders }) => { headers: AxiosHeaders }
  }[]
}

const runRequestInterceptor = () => {
  const interceptors = api.interceptors
    .request as unknown as RequestInterceptors
  return interceptors.handlers[0].fulfilled({ headers: new AxiosHeaders() })
}

describe('api client', () => {
  afterEach(() => {
    setAuthToken(null)
    setDeviceToken(null)
  })

  it('Should send the mobile client headers', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json')
    expect(api.defaults.headers['X-Client']).toBe('mobile')
  })
  it('Should use a defined base url', () => {
    expect(typeof API_BASE_URL).toBe('string')
    expect(api.defaults.baseURL).toBe(API_BASE_URL)
  })
  it('Should attach a bearer token', () => {
    setAuthToken('jwt-token')
    expect(api.defaults.headers.common['Authorization']).toBe(
      'Bearer jwt-token'
    )
  })
  it('Should remove the bearer token when cleared', () => {
    setAuthToken('jwt-token')
    setAuthToken(null)
    expect(api.defaults.headers.common['Authorization']).toBeUndefined()
  })
  it('Should add the device token header through the request interceptor', () => {
    setDeviceToken('device-1')
    expect(runRequestInterceptor().headers.get('X-Device-Token')).toBe(
      'device-1'
    )
  })
  it('Should omit the device token header when none is set', () => {
    setDeviceToken(null)
    expect(
      runRequestInterceptor().headers.get('X-Device-Token')
    ).toBeUndefined()
  })
})
