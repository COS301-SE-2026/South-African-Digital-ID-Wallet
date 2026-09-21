import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'

import { renderWithSafeArea } from '@/test/utils/render-with-providers'

import { useEmergencyResolve } from '@/hooks'

import { EmergencyScanPage } from '../emergency-scan-page'

const mockScanner: { onScan?: (text: string) => void } = {}

jest.mock('expo-router', () => ({ useFocusEffect: jest.fn() }))

jest.mock('@/hooks', () => ({
  __esModule: true,
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

const EMERGENCY_CODE = 'https://flashid.co.za/e#1.aGFuZGxl.dHM.c2ln'

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

const mockHook = (overrides = {}) => {
  const resolve = jest.fn()
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

const scan = async (text: string) => {
  await act(async () => {
    mockScanner.onScan?.(text)
  })
}

describe('<EmergencyScanPage/>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockScanner.onScan = undefined
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

  it('Should say offline frames are not supported yet', async () => {
    mockHook()
    await renderWithSafeArea(<EmergencyScanPage />)
    await scan('FIDE1/0/3/chunk')

    expect(screen.getByTestId('emergency-scan-screen')).toBeTruthy()
    expect(
      screen.getByText(/Offline emergency codes are not supported/i)
    ).toBeTruthy()
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
    await renderWithSafeArea(<EmergencyScanPage />)

    fireEvent.press(screen.getByTestId('emergency-done-button'))
    expect(reset).toHaveBeenCalled()
  })

  it('Should surface a resolve error on the gate', async () => {
    mockHook({ error: 'This emergency code is not valid.' })
    await renderWithSafeArea(<EmergencyScanPage />)
    await scan(EMERGENCY_CODE)

    expect(screen.getByTestId('break-glass-error')).toBeTruthy()
  })
})
