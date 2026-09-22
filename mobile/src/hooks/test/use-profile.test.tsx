import { act, renderHook, waitFor } from '@testing-library/react-native'

import { createQueryWrapper } from '@/test/utils/render-with-providers'
import { profileService } from '@/services/profile-service'

import {
  useAccountDetails,
  useProfile,
  useTrustedDevices,
  useUpdatePassword,
  useUserNotifications,
} from '../use-profile'

jest.mock('@/services/profile-service/profile-service', () => ({
  __esModule: true,
  default: {
    confirmEmailChange: jest.fn(),
    getAccount: jest.fn(),
    getNotifications: jest.fn(),
    getProfile: jest.fn(),
    getTrustedDevices: jest.fn(),
    requestEmailChange: jest.fn(),
    resendEmailOtp: jest.fn(),
    unlinkDevice: jest.fn(),
    updatePassword: jest.fn(),
    verifyPassword: jest.fn(),
  },
}))

const getProfile = profileService.getProfile as jest.Mock
const getAccount = profileService.getAccount as jest.Mock
const getDevices = profileService.getTrustedDevices as jest.Mock
const getNotifications = profileService.getNotifications as jest.Mock
const unlinkDevice = profileService.unlinkDevice as jest.Mock
const updatePassword = profileService.updatePassword as jest.Mock

const PROFILE = {
  email: 'thabo@flashid.co.za',
  names: 'Thabo',
  role: 'citizen',
  saId: '9202204720082',
  surname: 'Mokoena',
  userId: 'u-1',
}

describe('useProfile', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should expose the fetched profile', async () => {
    getProfile.mockResolvedValue(PROFILE)
    const { result } = await renderHook(() => useProfile(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.profile).toEqual(PROFILE))
  })
  it('Should keep the profile null on failure', async () => {
    getProfile.mockRejectedValue(new Error('boom'))
    const { result } = await renderHook(() => useProfile(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.profile).toBeNull()
  })
})

describe('useAccountDetails', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should not fetch while disabled', async () => {
    const { result } = await renderHook(() => useAccountDetails(false), {
      wrapper: createQueryWrapper(),
    })
    expect(getAccount).not.toHaveBeenCalled()
    expect(result.current.account).toBeNull()
  })
  it('Should fetch once enabled', async () => {
    getAccount.mockResolvedValue({ fullName: 'Thabo Mokoena' })
    const { result } = await renderHook(() => useAccountDetails(true), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() =>
      expect(result.current.account).toEqual({ fullName: 'Thabo Mokoena' })
    )
  })
})

describe('useTrustedDevices', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should default to an empty device list', async () => {
    const { result } = await renderHook(() => useTrustedDevices(false), {
      wrapper: createQueryWrapper(),
    })
    expect(result.current.devices).toEqual([])
  })
  it('Should expose the fetched devices', async () => {
    getDevices.mockResolvedValue([{ id: 'd-1' }])
    const { result } = await renderHook(() => useTrustedDevices(true), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.devices).toHaveLength(1))
  })
  it('Should unlink a device by id', async () => {
    getDevices.mockResolvedValue([{ id: 'd-1' }])
    unlinkDevice.mockResolvedValue(undefined)
    const { result } = await renderHook(() => useTrustedDevices(true), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.devices).toHaveLength(1))
    await act(async () => {
      result.current.unlink('d-1')
    })
    await waitFor(() => expect(unlinkDevice.mock.calls[0][0]).toBe('d-1'))
  })
})

describe('useUserNotifications', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should default to an empty list', async () => {
    const { result } = await renderHook(() => useUserNotifications(false), {
      wrapper: createQueryWrapper(),
    })
    expect(result.current.notifications).toEqual([])
  })
  it('Should expose the fetched notifications', async () => {
    getNotifications.mockResolvedValue([{ id: 'n-1', title: 'Hi' }])
    const { result } = await renderHook(() => useUserNotifications(true), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.notifications).toHaveLength(1))
  })
})

describe('useUpdatePassword', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should forward the password dto to the service', async () => {
    updatePassword.mockResolvedValue({ ok: true })
    const { result } = await renderHook(() => useUpdatePassword(), {
      wrapper: createQueryWrapper(),
    })
    const dto = {
      confirmPassword: 'New1!Passw0rd',
      currentPassword: 'Old1!Passw0rd',
      newPassword: 'New1!Passw0rd',
    }
    await act(async () => {
      await result.current.updatePassword(dto)
    })
    expect(updatePassword).toHaveBeenCalledWith(dto)
  })
})
