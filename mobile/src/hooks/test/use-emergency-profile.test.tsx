import { act, renderHook, waitFor } from '@testing-library/react-native'

import { emergencyService } from '@/services/emergency-service'
import { createQueryWrapper } from '@/test/utils/render-with-providers'

import {
  useEmergencyDeviceStatus,
  useEmergencyProfile,
} from '../use-emergency-profile'

import FlashidEmergency from '@/../modules/flashid-emergency'

jest.mock('@/services/emergency-service/emergency-service', () => ({
  __esModule: true,
  default: {
    getOfflineCredential: jest.fn(),
    getProfile: jest.fn(),
    saveProfile: jest.fn(),
  },
}))

jest.mock('@/../modules/flashid-emergency', () => ({
  __esModule: true,
  default: {
    disableEmergency: jest.fn(),
    isConfigured: jest.fn(),
    setOfflineBundle: jest.fn(),
  },
}))

const getProfile = emergencyService.getProfile as jest.Mock
const saveProfile = emergencyService.saveProfile as jest.Mock
const getOffline = emergencyService.getOfflineCredential as jest.Mock
const disable = FlashidEmergency.disableEmergency as jest.Mock
const isConfigured = FlashidEmergency.isConfigured as jest.Mock
const setBundle = FlashidEmergency.setOfflineBundle as jest.Mock

const PROFILE = {
  consentGivenAt: '2026-09-01T10:00:00Z',
  contacts: [],
  fields: { bloodType: 'O negative' },
  isEnabled: true,
  medicalLastUpdatedAt: '2026-09-01T10:00:00Z',
  offlineFields: ['bloodType' as const],
}

const REQUEST = {
  consentGiven: true,
  contacts: [],
  fields: { bloodType: 'O negative' },
  isEnabled: true,
  offlineFields: ['bloodType' as const],
}

describe('useEmergencyProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getProfile.mockResolvedValue(PROFILE)
    saveProfile.mockResolvedValue(PROFILE)
    getOffline.mockResolvedValue({ expiresAt: '2026-10-01', sdJwt: 'a.b.c~' })
    disable.mockResolvedValue(undefined)
    isConfigured.mockResolvedValue(true)
    setBundle.mockResolvedValue(undefined)
  })

  it('Should load the saved profile', async () => {
    const { result } = await renderHook(() => useEmergencyProfile(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.profile).toEqual(PROFILE))
    expect(result.current.isLoading).toBe(false)
  })

  it('Should save and refresh the offline code on a set-up phone', async () => {
    const { result } = await renderHook(() => useEmergencyProfile(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.save(REQUEST)
    })
    expect(saveProfile).toHaveBeenCalledWith(REQUEST)
    expect(setBundle).toHaveBeenCalledWith('a.b.c~')
    expect(disable).not.toHaveBeenCalled()
  })

  it('Should not fetch an offline code when the phone is not set up', async () => {
    isConfigured.mockResolvedValue(false)
    const { result } = await renderHook(() => useEmergencyProfile(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.save(REQUEST)
    })
    expect(getOffline).not.toHaveBeenCalled()
    expect(setBundle).not.toHaveBeenCalled()
  })

  it('Should clear the lock-screen button when the profile is switched off', async () => {
    saveProfile.mockResolvedValue({ ...PROFILE, isEnabled: false })
    const { result } = await renderHook(() => useEmergencyProfile(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.save({ ...REQUEST, isEnabled: false })
    })
    expect(disable).toHaveBeenCalled()
    expect(setBundle).not.toHaveBeenCalled()
  })

  it('Should still save when the offline code cannot be refreshed', async () => {
    getOffline.mockRejectedValue(new Error('offline'))
    const { result } = await renderHook(() => useEmergencyProfile(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await expect(result.current.save(REQUEST)).resolves.toEqual(PROFILE)
    })
  })

  it('Should report a failed save', async () => {
    saveProfile.mockRejectedValue(new Error('500'))
    const { result } = await renderHook(() => useEmergencyProfile(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.save(REQUEST).catch(() => undefined)
    })
    await waitFor(() => expect(result.current.saveError).not.toBeNull())
  })
})

describe('useEmergencyDeviceStatus', () => {
  it('Should report whether this phone is set up', async () => {
    isConfigured.mockResolvedValue(true)
    const { result } = await renderHook(() => useEmergencyDeviceStatus(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isConfigured).toBe(true))
    expect(result.current.isChecking).toBe(false)
  })
})
