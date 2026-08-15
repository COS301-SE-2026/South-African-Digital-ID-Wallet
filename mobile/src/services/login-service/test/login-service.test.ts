import api, { setAuthToken } from '@/lib/api'

import loginService from '../login-service'
import type { LoginResponse } from '../types'
import { log } from 'console'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
  setAuthToken: jest.fn(),
}))

const postMock = api.post as jest.Mock

const session: LoginResponse = {
  userId: 'u-1',
  role: 'citizen',
  names: 'Thabo',
  surname: 'Mokoena',
  token: 'jwt-token',
  expiresAt: '2026-08-16T10:00:00Z',
}

describe('loginService', () => {
  beforeEach(() => jest.clearAllMocks())
  it('Should post the mapped dto to the login endpoint and unwrap the data', async () => {
    postMock.mockResolvedValue({ data: session })
    await expect(
      loginService.login({
        email: ' thabo@flashid.co.za ',
        password: 'hunter2',
      })
    ).resolves.toEqual(session)
    expect(postMock).toHaveBeenCalledWith('/api/auth/login', {
      email: 'thabo@flashid.co.za',
      password: 'hunter2',
      rememberMe: true,
    })
  })
  it('Should propagate transport failures to the caller', async () => {
    postMock.mockRejectedValue(new Error('network down'))
    await expect(
      loginService.login({ email: 'thabo@flashid.co.za', password: 'hunter2' })
    ).rejects.toThrow('network down')
  })
  it('Should post to the logout endpoint without a body', async () => {
    postMock.mockResolvedValue({ data: null })
    await loginService.logout()
    expect(postMock).toHaveBeenCalledWith('/api/auth/logout')
  })
})
