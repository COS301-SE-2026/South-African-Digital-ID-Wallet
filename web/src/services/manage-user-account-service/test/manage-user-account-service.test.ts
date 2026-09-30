import api from '@/lib/api'
import manageUserAccountService from '../manage-user-account-service'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}))
const mockedApi = api as unknown as {
  get: jest.Mock
  post: jest.Mock
}
describe('manageUserAccountService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('gets the current user account', async () => {
    const data = {
      fullName: 'Thabo Mokoena',
      idEnding: '0087',
      emailAddress: 'thabo@example.com',
      phoneNumber: '0820000000',
      dateOfBirth: '1990-01-01',
      memberSince: '2026-01-01',
      lastLogin: null,
      accountStatus: 'Activated',
    }
    mockedApi.get.mockResolvedValue({ data })
    const result = await manageUserAccountService.getMyAccount()
    expect(mockedApi.get).toHaveBeenCalledWith('/api/manage-user-account/me')
    expect(result).toEqual(data)
  })
  it('verifies the current password', async () => {
    const data = {
      message: 'Password verified successfully.',
    }
    mockedApi.post.mockResolvedValue({ data })
    const result = await manageUserAccountService.verifyPassword('Password123!')
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/api/manage-user-account/email/verify-password',
      {
        password: 'Password123!',
      }
    )
    expect(result).toEqual(data)
  })
  it('requests an email change', async () => {
    const data = {
      message: 'Verification code sent.',
    }
    mockedApi.post.mockResolvedValue({ data })
    const result =
      await manageUserAccountService.requestEmailChange('new@example.com')
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/api/manage-user-account/email/request-change',
      {
        newEmail: 'new@example.com',
      }
    )
    expect(result).toEqual(data)
  })
  it('resends the email change OTP', async () => {
    const data = {
      message: 'Verification code resent.',
    }
    mockedApi.post.mockResolvedValue({ data })
    const result = await manageUserAccountService.resendEmailChangeOtp()
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/api/manage-user-account/email/resend-otp'
    )
    expect(result).toEqual(data)
  })
  it('confirms an email change', async () => {
    const data = {
      fullName: 'Thabo Mokoena',
      idEnding: '0087',
      emailAddress: 'new@example.com',
      phoneNumber: '0820000000',
      dateOfBirth: '1990-01-01',
      memberSince: '2026-01-01',
      lastLogin: null,
      accountStatus: 'Activated',
    }
    mockedApi.post.mockResolvedValue({ data })
    const result = await manageUserAccountService.confirmEmailChange('123456')
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/api/manage-user-account/email/confirm',
      {
        otp: '123456',
      }
    )
    expect(result).toEqual(data)
  })
  it('propagates API errors', async () => {
    mockedApi.post.mockRejectedValue(new Error('Account request failed'))
    await expect(
      manageUserAccountService.verifyPassword('wrong-password')
    ).rejects.toThrow('Account request failed')
  })
})
