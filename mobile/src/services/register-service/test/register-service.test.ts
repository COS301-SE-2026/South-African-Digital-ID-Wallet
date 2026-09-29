import { AxiosError, type AxiosResponse } from 'axios'

import api from '@/lib/api'

import registerService from '../register-service'
import registerUrls from '../register-urls'
import { resolveRegisterError } from '../register-errors'
import { resendOtpDto, verifyEmailDto } from '../register-dto'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
  setAuthToken: jest.fn(),
  setDeviceToken: jest.fn(),
}))

const postMock = api.post as jest.Mock

const axiosErrorWith = (status: number | undefined, data: unknown = {}) =>
  new AxiosError(
    'failed',
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    status === undefined ? undefined : ({ status, data } as AxiosResponse)
  )

describe('registerUrls', () => {
  it('Should expose every registration endpoint', () => {
    expect(registerUrls.register()).toBe('/api/citizens/register')
    expect(registerUrls.resendOtp()).toBe('/api/citizens/resend-otp')
    expect(registerUrls.verifyEmail()).toBe('/api/citizens/verify-email')
  })
})

describe('register dtos', () => {
  it('Should trim and pascal-case the verify payload', () => {
    expect(verifyEmailDto({ email: ' a@b.co ', otp: ' 123456 ' })).toEqual({
      Email: 'a@b.co',
      OTP: '123456',
    })
  })
  it('Should trim the resend payload', () => {
    expect(resendOtpDto('  a@b.co ')).toEqual({ Email: 'a@b.co' })
  })
})

describe('registerService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should POST the mapped registration dto', async () => {
    postMock.mockResolvedValue({ data: { userId: 'u-1' } })
    await expect(
      registerService.register({
        email: ' a@b.co ',
        password: 'Str0ng!Pass1',
        confirmPassword: 'Str0ng!Pass1',
      })
    ).resolves.toEqual({ userId: 'u-1' })
    expect(postMock).toHaveBeenCalledWith('/api/citizens/register', {
      Email: 'a@b.co',
      Password: 'Str0ng!Pass1',
    })
  })
  it('Should POST the verify-email dto', async () => {
    postMock.mockResolvedValue({ data: { ok: true } })
    await registerService.verifyEmail({ email: 'a@b.co', otp: '123456' })
    expect(postMock).toHaveBeenCalledWith('/api/citizens/verify-email', {
      Email: 'a@b.co',
      OTP: '123456',
    })
  })
  it('Should POST the resend-otp dto', async () => {
    postMock.mockResolvedValue({ data: { ok: true } })
    await registerService.resendOtp('a@b.co')
    expect(postMock).toHaveBeenCalledWith('/api/citizens/resend-otp', {
      Email: 'a@b.co',
    })
  })
  it('Should propagate transport failures', async () => {
    postMock.mockRejectedValue(new Error('network down'))
    await expect(registerService.resendOtp('a@b.co')).rejects.toThrow(
      'network down'
    )
  })
})

describe('resolveRegisterError', () => {
  it('Should prefer an explicit server message', () => {
    expect(
      resolveRegisterError(axiosErrorWith(400, { error: 'Bad email.' }))
    ).toBe('Bad email.')
  })
  it('Should explain a duplicate account on 409', () => {
    expect(resolveRegisterError(axiosErrorWith(409))).toBe(
      'An account with this email already exists.'
    )
  })
  it('Should explain rate limiting on 429', () => {
    expect(resolveRegisterError(axiosErrorWith(429))).toBe(
      'Too many attempts. Please wait a minute and try again.'
    )
  })
  it('Should report a connection problem when there is no response', () => {
    expect(resolveRegisterError(axiosErrorWith(undefined))).toBe(
      'Could not reach the server. Check your connection.'
    )
  })
  it('Should fall back for a non-axios error', () => {
    expect(resolveRegisterError(new Error('boom'))).toBe(
      'Something went wrong. Please try again.'
    )
  })
})
