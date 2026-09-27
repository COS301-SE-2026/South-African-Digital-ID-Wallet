import api from '@/lib/api'

import profileService from '../profile-service'
import profileUrls from '../profile-urls'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    delete: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
  setAuthToken: jest.fn(),
  setDeviceToken: jest.fn(),
}))

const getMock = api.get as jest.Mock
const postMock = api.post as jest.Mock
const putMock = api.put as jest.Mock
const deleteMock = api.delete as jest.Mock

describe('profileUrls', () => {
  it('Should expose every account endpoint', () => {
    expect(profileUrls.account()).toBe('/api/manage-user-account/me')
    expect(profileUrls.devices()).toBe('/api/trusted-devices/me')
    expect(profileUrls.device('d-1')).toBe('/api/trusted-devices/d-1')
    expect(profileUrls.notifications()).toBe('/api/notifications/me')
    expect(profileUrls.password()).toBe('/api/updatepassword')
    expect(profileUrls.profile()).toBe('/api/auth/me')
    expect(profileUrls.emailConfirm()).toBe(
      '/api/manage-user-account/email/confirm'
    )
    expect(profileUrls.emailRequestChange()).toBe(
      '/api/manage-user-account/email/request-change'
    )
    expect(profileUrls.emailResendOtp()).toBe(
      '/api/manage-user-account/email/resend-otp'
    )
    expect(profileUrls.emailVerifyPassword()).toBe(
      '/api/manage-user-account/email/verify-password'
    )
  })
})

describe('profileService', () => {
  beforeEach(() => jest.clearAllMocks())

  it.each([
    ['getProfile', '/api/auth/me'],
    ['getAccount', '/api/manage-user-account/me'],
    ['getTrustedDevices', '/api/trusted-devices/me'],
    ['getNotifications', '/api/notifications/me'],
  ])('Should GET %s from %s and unwrap the data', async (method, url) => {
    getMock.mockResolvedValue({ data: { ok: true } })
    const call = profileService[method as 'getProfile']
    await expect(call()).resolves.toEqual({ ok: true })
    expect(getMock).toHaveBeenCalledWith(url)
  })

  it('Should DELETE a trusted device by id', async () => {
    deleteMock.mockResolvedValue({ data: null })
    await profileService.unlinkDevice('d-1')
    expect(deleteMock).toHaveBeenCalledWith('/api/trusted-devices/d-1')
  })

  it('Should PUT the password payload', async () => {
    putMock.mockResolvedValue({ data: { ok: true } })
    const dto = {
      confirmPassword: 'New1!Passw0rd',
      currentPassword: 'Old1!Passw0rd',
      newPassword: 'New1!Passw0rd',
    }
    await profileService.updatePassword(dto)
    expect(putMock).toHaveBeenCalledWith('/api/updatepassword', dto)
  })

  it('Should POST the password to the verify endpoint', async () => {
    postMock.mockResolvedValue({ data: { ok: true } })
    await profileService.verifyPassword('hunter2')
    expect(postMock).toHaveBeenCalledWith(
      '/api/manage-user-account/email/verify-password',
      { password: 'hunter2' }
    )
  })

  it('Should POST the requested new email', async () => {
    postMock.mockResolvedValue({ data: { ok: true } })
    await profileService.requestEmailChange('new@flashid.co.za')
    expect(postMock).toHaveBeenCalledWith(
      '/api/manage-user-account/email/request-change',
      { newEmail: 'new@flashid.co.za' }
    )
  })

  it('Should POST to resend the email otp without a body', async () => {
    postMock.mockResolvedValue({ data: { ok: true } })
    await profileService.resendEmailOtp()
    expect(postMock).toHaveBeenCalledWith(
      '/api/manage-user-account/email/resend-otp'
    )
  })

  it('Should POST the otp to confirm the change', async () => {
    postMock.mockResolvedValue({ data: { ok: true } })
    await profileService.confirmEmailChange('123456')
    expect(postMock).toHaveBeenCalledWith(
      '/api/manage-user-account/email/confirm',
      {
        otp: '123456',
      }
    )
  })

  it('Should propagate transport failures', async () => {
    getMock.mockRejectedValue(new Error('network down'))
    await expect(profileService.getProfile()).rejects.toThrow('network down')
  })
})
