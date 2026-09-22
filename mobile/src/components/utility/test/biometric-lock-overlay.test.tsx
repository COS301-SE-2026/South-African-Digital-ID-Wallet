import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native'

import { useAuthStore } from '@/stores/auth-store'

import { BiometricLockOverlay } from '../biometric-lock-overlay'

const mockUnlock = jest.fn()
const mockSignOut = jest.fn()

jest.mock('@/hooks', () => ({
  useBiometricUnlock: () => ({
    reset: jest.fn(),
    status: 'idle',
    unlock: mockUnlock,
  }),
  useSignOut: () => mockSignOut,
}))
jest.mock('@/lib/secure-session', () => ({
  clearSession: jest.fn().mockResolvedValue(undefined),
  loadSession: jest.fn().mockResolvedValue(null),
  saveSession: jest.fn().mockResolvedValue(undefined),
  setBiometricPreference: jest.fn().mockResolvedValue(undefined),
}))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
  setAuthToken: jest.fn(),
  setDeviceToken: jest.fn(),
}))

const initial = useAuthStore.getState()

const signIn = () =>
  useAuthStore.getState().signIn({
    expiresAt: '2099-01-01T00:00:00Z',
    names: 'Thabo',
    role: 'citizen',
    surname: 'Mokoena',
    token: 'jwt',
    userId: 'u-1',
  })

describe('<BiometricLockOverlay/>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.setState(initial, true)
    mockUnlock.mockResolvedValue('denied')
  })

  it('Should render nothing when signed out', async () => {
    await render(<BiometricLockOverlay />)
    expect(screen.queryByTestId('biometric-lock-overlay')).toBeNull()
  })
  it('Should render nothing while unlocked', async () => {
    signIn()
    await render(<BiometricLockOverlay />)
    expect(screen.queryByTestId('biometric-lock-overlay')).toBeNull()
  })
  it('Should show the overlay when locked', async () => {
    signIn()
    useAuthStore.setState({ isLocked: true })
    await render(<BiometricLockOverlay />)
    expect(screen.getByTestId('biometric-lock-overlay')).toBeTruthy()
  })
  it('Should greet the signed-in user by name', async () => {
    signIn()
    useAuthStore.setState({ isLocked: true })
    await render(<BiometricLockOverlay />)
    expect(
      screen.getByText('Welcome back, Thabo. Unlock to continue.')
    ).toBeTruthy()
  })
  it('Should fall back to a neutral prompt with no name', async () => {
    signIn()
    useAuthStore.setState({ isLocked: true, user: null })
    await render(<BiometricLockOverlay />)
    expect(screen.getByText('Unlock to continue.')).toBeTruthy()
  })
  it('Should prompt automatically when it becomes locked', async () => {
    signIn()
    useAuthStore.setState({ isLocked: true })
    await render(<BiometricLockOverlay />)
    await waitFor(() =>
      expect(mockUnlock).toHaveBeenCalledWith('Unlock FlashID')
    )
  })
  it('Should clear the lock on a successful unlock', async () => {
    mockUnlock.mockResolvedValue('unlocked')
    signIn()
    useAuthStore.setState({ isLocked: true })
    await render(<BiometricLockOverlay />)
    await waitFor(() => expect(useAuthStore.getState().isLocked).toBe(false))
  })
  it('Should sign the user out when biometrics are unavailable', async () => {
    mockUnlock.mockResolvedValue('unavailable')
    signIn()
    useAuthStore.setState({ isLocked: true })
    await render(<BiometricLockOverlay />)
    await waitFor(() => expect(mockSignOut).toHaveBeenCalled())
  })
  it('Should retry from the unlock button', async () => {
    signIn()
    useAuthStore.setState({ isLocked: true })
    await render(<BiometricLockOverlay />)
    await waitFor(() => expect(mockUnlock).toHaveBeenCalledTimes(1))
    await fireEvent.press(screen.getByTestId('biometric-unlock'))
    await waitFor(() => expect(mockUnlock).toHaveBeenCalledTimes(2))
  })
  it('Should sign out from the escape hatch', async () => {
    signIn()
    useAuthStore.setState({ isLocked: true })
    await render(<BiometricLockOverlay />)
    await fireEvent.press(screen.getByText('Sign in as someone else'))
    await waitFor(() => expect(mockSignOut).toHaveBeenCalled())
  })
})
