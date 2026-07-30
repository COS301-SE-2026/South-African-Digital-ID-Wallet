import { render } from '@testing-library/react'
import toast from 'react-hot-toast'
import { SessionTimeoutWatcher } from '@/components/utility/session-timeout-watcher'
import { useUser } from '@/context/user-context'

jest.mock('react-hot-toast', () => {
  const mockToast = jest.fn() as jest.Mock & { error: jest.Mock }
  mockToast.error = jest.fn()
  return { __esModule: true, default: mockToast }
})

jest.mock('@/context/user-context', () => ({ useUser: jest.fn() }))

const mockedToast = toast as unknown as jest.Mock & { error: jest.Mock }
const mockedUseUser = useUser as jest.Mock
const EXPIRY_KEY = 'flashid-session-expires-at'
const signedInUser = {
  userId: 'u-1',
  email: 'thabo@example.com',
  role: 'Citizen',
}

const setExpiryInMinutes = (minutes: number) =>
  window.localStorage.setItem(
    EXPIRY_KEY,
    new Date(Date.now() + minutes * 60_000).toISOString()
  )

describe('SessionTImeoutWatcher', () => {
  const logout = jest.fn()

  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    window.localStorage.clear()
    mockedUseUser.mockReturnValue({ user: signedInUser, logout })
  })

  afterEach(() => jest.useRealTimers())

  it('Should do nothing when nobody is signed in', () => {
    mockedUseUser.mockReturnValue({ user: null, logout })
    setExpiryInMinutes(-1)
    render(<SessionTimeoutWatcher />)
    expect(mockedToast.error).not.toHaveBeenCalled()
    expect(logout).not.toHaveBeenCalled()
  })

  it('Should do nothing when no expiry stored', () => {
    render(<SessionTimeoutWatcher />)
    expect(mockedToast).not.toHaveBeenCalled()
    expect(logout).not.toHaveBeenCalled()
  })

  it('Should stay quiet while session is valid', () => {
    setExpiryInMinutes(30)
    render(<SessionTimeoutWatcher />)
    expect(mockedToast).not.toHaveBeenCalled()
  })

  it('Should warn once as expiry approaches', () => {
    setExpiryInMinutes(3)
    render(<SessionTimeoutWatcher />)
    expect(mockedToast).toHaveBeenCalledTimes(1)
    expect(mockedToast).toHaveBeenCalledWith(
      expect.stringContaining('expire in about'),
      { duration: 8000 }
    )
    expect(logout).not.toHaveBeenCalled()
    jest.advanceTimersByTime(60_000)
    expect(mockedToast).toHaveBeenCalledTimes(1)
  })

  it('Should log the user out when session expires', () => {
    setExpiryInMinutes(-1)
    render(<SessionTimeoutWatcher />)
    expect(mockedToast.error).toHaveBeenCalledWith(
      'Your session has expired. Please log in again.'
    )
    expect(window.localStorage.getItem(EXPIRY_KEY)).toBeNull()
    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('Should expire the session on later interval tick', () => {
    setExpiryInMinutes(0.5)
    render(<SessionTimeoutWatcher />)
    expect(logout).not.toHaveBeenCalled()
    jest.advanceTimersByTime(60_000)
    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('Should clear interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
    setExpiryInMinutes(30)
    const { unmount } = render(<SessionTimeoutWatcher />)
    unmount()
    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
