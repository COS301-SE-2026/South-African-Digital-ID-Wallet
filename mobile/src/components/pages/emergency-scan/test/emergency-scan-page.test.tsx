import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'

import { renderWithSafeArea } from '@/test/utils/render-with-providers'

import { useEmergencyOfflineRead, useEmergencyResolve } from '@/hooks'

import { EmergencyScanPage } from '../emergency-scan-page'

const mockScanner: { onScan?: (text: string) => void } = {}

jest.mock('expo-router', () => ({ useFocusEffect: jest.fn() }))

jest.mock('@/hooks', () => ({
  __esModule: true,
  useEmergencyOfflineRead: jest.fn(),
  useEmergencyResolve: jest.fn(),
}))

jest.mock('@/components/organisms', () => {
  const actual = jest.requireActual('@/components/organisms')
  return {
    ...actual,
    QrCameraScanner: (props: { onScan: (text: string) => void }) => {
      mockScanner.onScan = props.onScan
      return null
    },
  }
})

const useResolve = useEmergencyResolve as jest.Mock
const useOfflineRead = useEmergencyOfflineRead as jest.Mock

const EMERGENCY_CODE = 'https://flashid.co.za/e#1.aGFuZGxl.dHM.c2ln'
const OFFLINE_FRAME = 'FID1:P:AbCdEf:0/3:chunk'

const PROFILE = {
  accessedAt: '2026-09-21T10:00:00Z',
  contacts: [],
  identity: {
    dateOfBirth: '1990-04-12',
    names: 'Thandiwe',
    photoUrl: null,
    surname: 'Dlamini',
  },
  medical: [],
  medicalLastUpdatedAt: null,
}

const VERIFIED_OFFLINE = {
  ok: true,
  vct: 'urn:flashid:emergency-profile:1',
  revocationIndex: 1_000_000_042,
  claims: {
    full_name: 'Thandiwe Dlamini',
    blood_type: 'O negative',
    medical_updated_on: '2026-09-01',
  },
  warnings: [],
}

const mockHook = (overrides = {}) => {
  const resolve = jest.fn().mockResolvedValue(null)
  const reset = jest.fn()
  useResolve.mockReturnValue({
    error: null,
    isResolving: false,
    profile: null,
    reset,
    resolve,
    ...overrides,
  })
  return { reset, resolve }
}

const mockOffline = (overrides = {}) => {
  const addFrame = jest.fn()
  const confirm = jest.fn().mockResolvedValue(undefined)
  const reset = jest.fn()
  useOfflineRead.mockReturnValue({
    accessedAt: null,
    addFrame,
    confirm,
    gateError: null,
    isConfirming: false,
    progress: null,
    reset,
    result: null,
    ...overrides,
  })
  return { addFrame, confirm, reset }
}

const scan = async (text: string) => {
  await act(async () => {
    mockScanner.onScan?.(text)
  })
}

describe('<EmergencyScanPage/>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockScanner.onScan = undefined
    mockOffline()
  })

  it('Should open on the scanner', async () => {
    mockHook()
    await renderWithSafeArea(<EmergencyScanPage />)
    expect(screen.getByTestId('emergency-scan-screen')).toBeTruthy()
    expect(screen.getByText(/Scan the emergency QR/)).toBeTruthy()
  })

  it('Should show the break-glass gate after a valid code', async () => {
    mockHook()
    await renderWithSafeArea(<EmergencyScanPage />)
    await scan(EMERGENCY_CODE)

    expect(screen.getByTestId('emergency-gate-screen')).toBeTruthy()
    expect(screen.getByTestId('break-glass-gate')).toBeTruthy()
  })

  it('Should reject a code that is not a FlashID emergency code', async () => {
    mockHook()
    await renderWithSafeArea(<EmergencyScanPage />)
    await scan('hello world')

    expect(screen.getByTestId('emergency-scan-screen')).toBeTruthy()
    expect(screen.getByText(/not a FlashID emergency code/i)).toBeTruthy()
  })

  it('Should resolve with the typed justification and never before it', async () => {
    const { resolve } = mockHook()
    await renderWithSafeArea(<EmergencyScanPage />)
    await scan(EMERGENCY_CODE)

    expect(resolve).not.toHaveBeenCalled()

    await act(async () => {
      fireEvent.changeText(
        screen.getByTestId('break-glass-reason'),
        'Unconscious at roadside'
      )
    })
    fireEvent.press(screen.getByTestId('break-glass-confirm'))

    await waitFor(() => expect(resolve).toHaveBeenCalled())
    expect(resolve.mock.calls[0][0]).toEqual({
      code: EMERGENCY_CODE,
      justification: 'Unconscious at roadside',
      wasOffline: false,
    })
  })

  it('Should go back to the scanner when the gate is cancelled', async () => {
    mockHook()
    await renderWithSafeArea(<EmergencyScanPage />)
    await scan(EMERGENCY_CODE)

    await act(async () => {
      fireEvent.press(screen.getByTestId('break-glass-cancel'))
    })

    expect(screen.getByTestId('emergency-scan-screen')).toBeTruthy()
  })

  it('Should render the profile once resolved', async () => {
    mockHook({ profile: PROFILE })
    await renderWithSafeArea(<EmergencyScanPage />)

    expect(screen.getByTestId('emergency-profile-screen')).toBeTruthy()
    expect(screen.getByText('Thandiwe Dlamini')).toBeTruthy()
  })

  it('Should clear everything from the profile screen', async () => {
    const { reset } = mockHook({ profile: PROFILE })
    const offline = mockOffline()
    await renderWithSafeArea(<EmergencyScanPage />)

    fireEvent.press(screen.getByTestId('emergency-done-button'))
    expect(reset).toHaveBeenCalled()
    expect(offline.reset).toHaveBeenCalled()
  })

  it('Should surface a resolve error on the gate', async () => {
    mockHook({ error: 'This emergency code is not valid.' })
    await renderWithSafeArea(<EmergencyScanPage />)
    await scan(EMERGENCY_CODE)

    expect(screen.getByTestId('break-glass-error')).toBeTruthy()
  })

  it('Should send offline frames to the offline reader, not the online parser', async () => {
    mockHook()
    const { addFrame } = mockOffline()
    await renderWithSafeArea(<EmergencyScanPage />)
    await scan(OFFLINE_FRAME)

    expect(addFrame).toHaveBeenCalledWith(OFFLINE_FRAME)
    expect(screen.queryByText(/not a FlashID emergency code/i)).toBeNull()
  })

  it('Should show progress while the offline frames arrive', async () => {
    mockHook()
    mockOffline({ progress: { received: 1, total: 3 } })
    await renderWithSafeArea(<EmergencyScanPage />)

    expect(screen.getByText('Receiving offline code: 1 of 3')).toBeTruthy()
  })

  it('Should put a verified offline code behind the break-glass gate', async () => {
    mockHook()
    mockOffline({ result: VERIFIED_OFFLINE })
    await renderWithSafeArea(<EmergencyScanPage />)

    expect(screen.getByTestId('emergency-gate-screen')).toBeTruthy()
    expect(screen.queryByText('O negative')).toBeNull()
    expect(
      screen.getByText(/as soon as this phone is back online/)
    ).toBeTruthy()
  })

  it('Should hand the offline reason to the offline reader', async () => {
    mockHook()
    const { confirm } = mockOffline({ result: VERIFIED_OFFLINE })
    await renderWithSafeArea(<EmergencyScanPage />)

    await act(async () => {
      fireEvent.changeText(
        screen.getByTestId('break-glass-reason'),
        'Unconscious, no signal at scene'
      )
    })
    fireEvent.press(screen.getByTestId('break-glass-confirm'))

    await waitFor(() =>
      expect(confirm).toHaveBeenCalledWith('Unconscious, no signal at scene')
    )
  })

  it('Should show the offline profile only once the access is recorded', async () => {
    mockHook()
    mockOffline({
      accessedAt: new Date('2026-09-27T10:00:00Z'),
      result: VERIFIED_OFFLINE,
    })
    await renderWithSafeArea(<EmergencyScanPage />)

    expect(screen.getByTestId('emergency-profile-screen')).toBeTruthy()
    expect(screen.getByText('Thandiwe Dlamini')).toBeTruthy()
    expect(screen.getByText('O negative')).toBeTruthy()
    expect(
      screen.getByText(/citizen is told when this phone reconnects/)
    ).toBeTruthy()
  })

  it('Should explain an offline code that fails, and let the responder retry', async () => {
    mockHook()
    const offline = mockOffline({
      result: { ok: false, code: 'MALFORMED', warnings: [] },
    })
    await renderWithSafeArea(<EmergencyScanPage />)

    expect(screen.getByText(/could not be read/)).toBeTruthy()

    fireEvent.press(screen.getByTestId('emergency-offline-retry'))
    expect(offline.reset).toHaveBeenCalled()
  })
})
