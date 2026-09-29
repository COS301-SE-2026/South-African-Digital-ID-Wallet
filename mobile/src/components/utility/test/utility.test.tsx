import { render, screen } from '@testing-library/react-native'
import { AppState, type AppStateStatus } from 'react-native'
import { act } from 'react'

import { useAuthStore } from '@/stores/auth-store'

import { PrivacyScreenOverlay } from '../privacy-screen-overlay'
import { SessionLockWatcher } from '../session-lock-watcher'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {},
  setAuthToken: jest.fn(),
}))
jest.mock('@/lib/secure-session', () => ({
  clearSession: jest.fn(),
  loadSession: jest.fn(),
  saveSession: jest.fn().mockResolvedValue(undefined),
}))

const NOW = 1_700_000_000_000
let emit: (state: AppStateStatus) => void
const remove = jest.fn()
const pristine = useAuthStore.getState()

const signIn = (expiresAt = '2099-01-01T00:00:00Z') =>
  useAuthStore.getState().signIn({
    expiresAt,
    names: 'Thabo',
    role: 'citizen',
    surname: 'Mokoena',
    token: 'jwt-token',
    userId: 'u-1',
  })

beforeEach(() => {
  useAuthStore.setState(pristine, true)
  jest.clearAllMocks()
  jest.spyOn(Date, 'now').mockReturnValue(NOW)
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, cb) => {
    emit = cb as (state: AppStateStatus) => void
    return { remove } as never
  })
})
afterEach(() => jest.restoreAllMocks())

describe('<SessionLockWatcher/>', () => {
  it('Should ignore app state changes while signed out', async () => {
    await render(<SessionLockWatcher />)
    act(() => emit('background'))
    act(() => emit('active'))
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
  it('Should keep the session after a short background check', async () => {
    signIn()
    await render(<SessionLockWatcher />)
    act(() => emit('background'))
    act(() => emit('inactive'))
    ;(Date.now as jest.Mock).mockReturnValue(NOW + 60_000)
    act(() => emit('active'))
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })
  it('Should sign out after more than two minutes background', async () => {
    signIn()
    await render(<SessionLockWatcher />)
    act(() => emit('background'))
    ;(Date.now as jest.Mock).mockReturnValue(NOW + 121_000)
    act(() => emit('active'))
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
  it('Should sign out when the token has already expired', async () => {
    signIn('2020-01-01T00:00:00Z')
    await render(<SessionLockWatcher />)
    act(() => emit('background'))
    act(() => emit('active'))
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
  it('Should detach the listener on unmount', async () => {
    const view = await render(<SessionLockWatcher />)
    await view.unmount()
    expect(remove).toHaveBeenCalled()
  })
})

describe('<PrivacyScreenOverlay/>', () => {
  it('Should stay hidden while the app is active', async () => {
    signIn()
    await render(<PrivacyScreenOverlay />)
    expect(screen.queryByText('FlashID')).toBeNull()
  })
  it('Should mask the screen when a signed-in app backgrounds', async () => {
    signIn()
    await render(<PrivacyScreenOverlay />)
    act(() => emit('inactive'))
    expect(screen.getByText('FlashID')).toBeTruthy()
  })
  it('Should never mask a signed-out app', async () => {
    await render(<PrivacyScreenOverlay />)
    act(() => emit('background'))
    expect(screen.queryByText('FlashID')).toBeNull()
  })
})
