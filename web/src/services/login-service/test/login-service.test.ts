import api from '@/lib/api'

import loginService from '../login-service'
import type { LoginResponse, VerifyDeviceRequest } from '../types'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn(), get: jest.fn() },
}))

const postMock = api.post as jest.Mock
const getMock = api.get as jest.Mock

const session: LoginResponse = {
  userId: 'u-1',
  role: 'citizen',
  token: 'jwt-token',
  expiresAt: '2026-08-16T10:00:00Z',
  requiresDeviceVerification: false,
}

const deviceRequest: VerifyDeviceRequest = {
  deviceVerificationId: 'dv-1',
  otp: '123456',
  deviceType: 'Desktop',
  operatingSystem: 'macOS',
  browser: 'Chrome',
}

beforeEach(() => jest.clearAllMocks())

describe('loginService.login', () => {
  it('Should post the mapped dto to the login endpoint and unwrap the data', async () => {
    postMock.mockResolvedValue({ data: session })

    await expect(
      loginService.login({ email: 'thabo@flashid.co.za', password: 'hunter2' })
    ).resolves.toEqual(session)

    expect(postMock).toHaveBeenCalledWith('/api/auth/login', {
      email: 'thabo@flashid.co.za',
      password: 'hunter2',
      rememberMe: false,
    })
  })

  it('Should forward rememberMe when the user ticked it', async () => {
    postMock.mockResolvedValue({ data: session })

    await loginService.login({
      email: 'thabo@flashid.co.za',
      password: 'hunter2',
      rememberMe: true,
    })

    expect(postMock).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({ rememberMe: true })
    )
  })

  it('Should return the device-verification challenge instead of a session', async () => {
    const challenge: LoginResponse = {
      ...session,
      token: '',
      requiresDeviceVerification: true,
      deviceVerificationId: 'dv-1',
    }
    postMock.mockResolvedValue({ data: challenge })

    await expect(
      loginService.login({ email: 'thabo@flashid.co.za', password: 'hunter2' })
    ).resolves.toEqual(challenge)
  })

  it('Should propagate transport failures to the caller', async () => {
    postMock.mockRejectedValue(new Error('network down'))

    await expect(
      loginService.login({ email: 'thabo@flashid.co.za', password: 'hunter2' })
    ).rejects.toThrow('network down')
  })

  it('Should propagate the EMAIL_NOT_VERIFIED payload so the form can branch on it', async () => {
    postMock.mockRejectedValue({
      response: { status: 403, data: { code: 'EMAIL_NOT_VERIFIED' } },
    })

    await expect(
      loginService.login({ email: 'thabo@flashid.co.za', password: 'hunter2' })
    ).rejects.toMatchObject({
      response: { data: { code: 'EMAIL_NOT_VERIFIED' } },
    })
  })
})

describe('loginService.verifyDevice', () => {
  it('Should post the mapped dto to the verify-device endpoint', async () => {
    postMock.mockResolvedValue({ data: session })

    await expect(loginService.verifyDevice(deviceRequest)).resolves.toEqual(
      session
    )

    expect(postMock).toHaveBeenCalledWith('/api/auth/verify-device', {
      deviceVerificationId: 'dv-1',
      otp: '123456',
      deviceType: 'Desktop',
      operatingSystem: 'macOS',
      browser: 'Chrome',
      rememberMe: false,
    })
  })

  it('Should reject when the otp is wrong', async () => {
    postMock.mockRejectedValue({ response: { status: 401 } })

    await expect(
      loginService.verifyDevice(deviceRequest)
    ).rejects.toMatchObject({ response: { status: 401 } })
  })
})

describe('loginService.resendDeviceVerificationOtp', () => {
  it('Should post the verification id to the resend endpoint', async () => {
    postMock.mockResolvedValue({ data: null })

    await loginService.resendDeviceVerificationOtp('dv-1')

    expect(postMock).toHaveBeenCalledWith(
      '/api/auth/resend-device-verification',
      { deviceVerificationId: 'dv-1' }
    )
  })
})

describe('loginService.logout', () => {
  it('Should post to the logout endpoint without a body', async () => {
    postMock.mockResolvedValue({ data: null })

    await loginService.logout()

    expect(postMock).toHaveBeenCalledWith('/api/auth/logout')
  })
})

describe('loginService.getUser', () => {
  it('Should get the user by id and unwrap the data', async () => {
    getMock.mockResolvedValue({ data: { userId: 'u-1' } })

    await expect(loginService.getUser(1)).resolves.toEqual({ userId: 'u-1' })
    expect(getMock).toHaveBeenCalledWith('/api/auth/user/1')
  })
})
