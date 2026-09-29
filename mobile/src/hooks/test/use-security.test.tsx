import { QueryClient } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react-native'

import {
  securityKeys,
  useDismissAlert,
  useSecureAccount,
  useSecureAccountResult,
  useSecurityActivity,
  useSecurityAlert,
  useSecurityOverview,
  useSecuritySettings,
  useUpdateSecuritySettings,
} from '@/hooks/use-security'
import securityService from '@/services/security-service/security-service'
import type {
  FraudAlertSummaryResponse,
  SecureAccountResponse,
  SecurityActivityResponse,
  SecuritySettingsResponse,
} from '@/services/security-service'
import { useSecurityResultStore } from '@/stores/security-result-store'
import {
  createQueryWrapper,
  createTestQueryClient,
} from '@/test/utils/render-with-providers'

const mockReplaceToken = jest.fn()

jest.mock('@/services/security-service/security-service', () => ({
  __esModule: true,
  default: {
    dismissAlert: jest.fn(),
    getActivity: jest.fn(),
    getAlert: jest.fn(),
    getOverview: jest.fn(),
    getSettings: jest.fn(),
    secureAccount: jest.fn(),
    updateSettings: jest.fn(),
  },
}))

jest.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (state: { replaceToken: jest.Mock }) => unknown) =>
    selector({ replaceToken: mockReplaceToken }),
}))

const getOverview = securityService.getOverview as jest.Mock
const getActivity = securityService.getActivity as jest.Mock
const getAlert = securityService.getAlert as jest.Mock
const secureAccount = securityService.secureAccount as jest.Mock
const dismissAlert = securityService.dismissAlert as jest.Mock
const getSettings = securityService.getSettings as jest.Mock
const updateSettings = securityService.updateSettings as jest.Mock

const createCachingQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity, retry: false } },
  })

const ALERT_ID = 'alert-1'

const ALERT: FraudAlertSummaryResponse = {
  detectedAt: '2026-05-14T14:22:00Z',
  eventType: 'Login',
  id: ALERT_ID,
  isImpossibleTravel: true,
  message: 'We detected a sign-in from London.',
  previousLocationLabel: 'Johannesburg, South Africa',
  riskLevel: 'High',
  riskScore: 90,
  status: 'Open',
  suspiciousLocationLabel: 'London, United Kingdom',
  title: 'Possible impossible travel',
}

const ACTIVITY: SecurityActivityResponse = {
  deviceDescription: 'Chrome on Windows',
  eventType: 'Login',
  id: 'event-1',
  isSuspicious: true,
  isTrustedDevice: false,
  locationLabel: 'London, United Kingdom',
  occurredAt: '2026-05-14T14:22:00Z',
  riskLevel: 'High',
  riskScore: 90,
  title: 'Signed in',
}

const SETTINGS: SecuritySettingsResponse = {
  deviceVerificationEnabled: true,
  enhancedVerificationEnabled: false,
  impossibleTravelDetectionEnabled: true,
  qrGenerationRestricted: false,
  qrRestrictedUntil: null,
  trustedDeviceCount: 2,
}

const SECURED: SecureAccountResponse = {
  action: 'LogOutOtherDevices',
  alertId: ALERT_ID,
  devicesRemoved: 1,
  expiresAt: '2026-10-28T00:00:00Z',
  message: "We've logged you out of other devices.",
  nextSteps: ["You'll need to log in again on other devices."],
  requiresPasswordChange: false,
  title: 'Your account is secured',
  token: 'rotated-jwt-token',
}

describe('use-security', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useSecurityResultStore.setState({ results: {} })
  })

  describe('useSecurityOverview', () => {
    it('Should expose the open alert, its count and the recent activity', async () => {
      getOverview.mockResolvedValue({
        activeAlertCount: 1,
        hasActiveAlert: true,
        latestAlert: ALERT,
        qrGenerationRestricted: true,
        qrRestrictedUntil: null,
        recentActivity: [ACTIVITY],
      })
      const { result } = await renderHook(() => useSecurityOverview(), {
        wrapper: createQueryWrapper(),
      })
      await waitFor(() => expect(result.current.alert).toEqual(ALERT))
      expect(result.current.activeAlertCount).toBe(1)
      expect(result.current.recentActivity).toHaveLength(1)
      expect(result.current.recentActivity[0].badge).toEqual({
        label: 'High',
        tone: 'danger',
      })
    })

    it('Should report no alert and a zero count when the request fails', async () => {
      getOverview.mockRejectedValue(new Error('boom'))
      const { result } = await renderHook(() => useSecurityOverview(), {
        wrapper: createQueryWrapper(),
      })
      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.alert).toBeNull()
      expect(result.current.activeAlertCount).toBe(0)
      expect(result.current.recentActivity).toEqual([])
    })
  })

  describe('useSecurityActivity', () => {
    it('Should not fetch until it is enabled', async () => {
      await renderHook(() => useSecurityActivity(false), {
        wrapper: createQueryWrapper(),
      })
      expect(getActivity).not.toHaveBeenCalled()
    })

    it('Should map the fetched history once enabled', async () => {
      getActivity.mockResolvedValue([ACTIVITY])
      const { result } = await renderHook(() => useSecurityActivity(true), {
        wrapper: createQueryWrapper(),
      })
      await waitFor(() => expect(result.current.entries).toHaveLength(1))
      expect(result.current.entries[0].title).toBe('Signed in')
    })
  })

  describe('useSecurityAlert', () => {
    it('Should fetch the alert by its id', async () => {
      getAlert.mockResolvedValue(ALERT)
      const { result } = await renderHook(() => useSecurityAlert(ALERT_ID), {
        wrapper: createQueryWrapper(),
      })
      await waitFor(() => expect(result.current.alert).toEqual(ALERT))
      expect(getAlert).toHaveBeenCalledWith(ALERT_ID)
    })

    it('Should not fetch without an alert id', async () => {
      const { result } = await renderHook(() => useSecurityAlert(''), {
        wrapper: createQueryWrapper(),
      })
      expect(getAlert).not.toHaveBeenCalled()
      expect(result.current.alert).toBeNull()
    })
  })

  describe('useSecureAccount', () => {
    it('Should swap in the new token and keep the result without it', async () => {
      secureAccount.mockResolvedValue(SECURED)
      const { result } = await renderHook(() => useSecureAccount(ALERT_ID), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.secureAccount({
          action: 'LogOutOtherDevices',
          password: 'password123',
        })
      })

      expect(secureAccount).toHaveBeenCalledWith(ALERT_ID, {
        action: 'LogOutOtherDevices',
        password: 'password123',
      })
      expect(mockReplaceToken).toHaveBeenCalledWith(
        'rotated-jwt-token',
        '2026-10-28T00:00:00Z'
      )
      const saved = useSecurityResultStore.getState().results[ALERT_ID]
      expect(saved?.title).toBe('Your account is secured')
      expect(saved?.token).toBeUndefined()
      expect(saved?.expiresAt).toBeUndefined()
    })

    it('Should keep the current token when the backend sends none', async () => {
      secureAccount.mockResolvedValue({
        ...SECURED,
        expiresAt: undefined,
        token: undefined,
      })
      const { result } = await renderHook(() => useSecureAccount(ALERT_ID), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.secureAccount({
          action: 'LogOutOtherDevices',
          password: 'password123',
        })
      })

      expect(mockReplaceToken).not.toHaveBeenCalled()
    })

    it('Should refresh the overview, history, alert and settings', async () => {
      secureAccount.mockResolvedValue(SECURED)
      const queryClient = createTestQueryClient()
      const invalidate = jest.spyOn(queryClient, 'invalidateQueries')
      const { result } = await renderHook(() => useSecureAccount(ALERT_ID), {
        wrapper: createQueryWrapper(queryClient),
      })

      await act(async () => {
        await result.current.secureAccount({
          action: 'AddExtraVerification',
          password: 'password123',
        })
      })

      const keys = invalidate.mock.calls.map(([filters]) => filters?.queryKey)
      expect(keys).toEqual(
        expect.arrayContaining([
          securityKeys.overview,
          securityKeys.activity,
          securityKeys.alert(ALERT_ID),
          securityKeys.settings,
        ])
      )
    })
  })

  describe('useSecureAccountResult', () => {
    it('Should read the saved result without a request', async () => {
      useSecurityResultStore.getState().save(ALERT_ID, SECURED)
      const { result } = await renderHook(() =>
        useSecureAccountResult(ALERT_ID)
      )
      expect(result.current?.title).toBe('Your account is secured')
    })

    it('Should return null when nothing was saved', async () => {
      const { result } = await renderHook(() =>
        useSecureAccountResult(ALERT_ID)
      )
      expect(result.current).toBeNull()
    })
  })

  describe('useDismissAlert', () => {
    it('Should send the password and refresh the alert', async () => {
      dismissAlert.mockResolvedValue(undefined)
      const queryClient = createTestQueryClient()
      const invalidate = jest.spyOn(queryClient, 'invalidateQueries')
      const { result } = await renderHook(() => useDismissAlert(ALERT_ID), {
        wrapper: createQueryWrapper(queryClient),
      })

      await act(async () => {
        await result.current.dismissAlert({ password: 'password123' })
      })

      expect(dismissAlert).toHaveBeenCalledWith(ALERT_ID, {
        password: 'password123',
      })
      const keys = invalidate.mock.calls.map(([filters]) => filters?.queryKey)
      expect(keys).toContainEqual(securityKeys.alert(ALERT_ID))
    })
  })

  describe('useSecuritySettings', () => {
    it('Should expose the fetched settings', async () => {
      getSettings.mockResolvedValue(SETTINGS)
      const { result } = await renderHook(() => useSecuritySettings(), {
        wrapper: createQueryWrapper(),
      })
      await waitFor(() => expect(result.current.settings).toEqual(SETTINGS))
    })

    it('Should keep the settings null on failure', async () => {
      getSettings.mockRejectedValue(new Error('boom'))
      const { result } = await renderHook(() => useSecuritySettings(), {
        wrapper: createQueryWrapper(),
      })
      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.settings).toBeNull()
    })
  })

  describe('useUpdateSecuritySettings', () => {
    it('Should store the updated settings in the cache', async () => {
      const updated = { ...SETTINGS, impossibleTravelDetectionEnabled: false }
      updateSettings.mockResolvedValue(updated)
      const queryClient = createCachingQueryClient()
      const { result } = await renderHook(() => useUpdateSecuritySettings(), {
        wrapper: createQueryWrapper(queryClient),
      })

      await act(async () => {
        await result.current.updateSettings({
          impossibleTravelDetectionEnabled: false,
          password: 'password123',
        })
      })

      expect(updateSettings).toHaveBeenCalledWith({
        impossibleTravelDetectionEnabled: false,
        password: 'password123',
      })
      expect(queryClient.getQueryData(securityKeys.settings)).toEqual(updated)
    })
  })
})
