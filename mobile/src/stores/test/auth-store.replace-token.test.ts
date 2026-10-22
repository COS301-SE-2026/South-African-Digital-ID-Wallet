import { setAuthToken } from '@/lib/api'
import { saveSession } from '@/lib/secure-session'
import type { LoginResponse } from '@/services'
import { useAuthStore } from '@/stores/auth-store'

jest.mock('@/lib/secure-session', () => ({
  clearSession: jest.fn(),
  getBiometricPreference: jest.fn().mockResolvedValue(true),
  loadSession: jest.fn(),
  saveSession: jest.fn().mockResolvedValue(undefined),
  setBiometricPreference: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/device-identity', () => ({
  clearDeviceToken: jest.fn().mockResolvedValue(undefined),
  loadDeviceToken: jest.fn().mockResolvedValue(null),
  saveDeviceToken: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
  setAuthToken: jest.fn(),
  setDeviceToken: jest.fn(),
}))

jest.mock('@/services/offline-service', () => ({
  offlineService: { clearOfflineData: jest.fn().mockResolvedValue(undefined) },
}))

const session: LoginResponse = {
  userId: 'u-1',
  role: 'citizen',
  names: 'Thabo',
  surname: 'Mokoena',
  token: 'jwt-token',
  expiresAt: '2026-08-16T10:00:00Z',
}

const NEW_TOKEN = 'rotated-jwt-token'
const NEW_EXPIRY = '2026-09-16T10:00:00Z'

const pristine = useAuthStore.getState()

describe('useAuthStore.replaceToken', () => {
  beforeEach(() => {
    useAuthStore.setState(pristine, true)
    jest.clearAllMocks()
  })

  it('Should swap in the new token and keep the user signed in', () => {
    useAuthStore.getState().signIn(session)
    useAuthStore.getState().replaceToken(NEW_TOKEN, NEW_EXPIRY)

    const state = useAuthStore.getState()
    expect(state.token).toBe(NEW_TOKEN)
    expect(state.expiresAt).toBe(NEW_EXPIRY)
    expect(state.isAuthenticated).toBe(true)
    expect(setAuthToken).toHaveBeenLastCalledWith(NEW_TOKEN)
  })

  it('Should persist the new token with the current user', () => {
    useAuthStore.getState().signIn(session)
    useAuthStore.getState().replaceToken(NEW_TOKEN, NEW_EXPIRY)

    expect(saveSession).toHaveBeenLastCalledWith({
      expiresAt: NEW_EXPIRY,
      token: NEW_TOKEN,
      user: {
        names: 'Thabo',
        role: 'citizen',
        surname: 'Mokoena',
        userId: 'u-1',
      },
    })
  })

  it('Should not persist a session when nobody is signed in', () => {
    useAuthStore.getState().replaceToken(NEW_TOKEN, NEW_EXPIRY)

    expect(setAuthToken).toHaveBeenCalledWith(NEW_TOKEN)
    expect(saveSession).not.toHaveBeenCalled()
  })
})

describe('useAuthStore.replaceToken with refresh credentials', () => {
  beforeEach(() => {
    useAuthStore.setState(pristine, true)
    jest.clearAllMocks()
  })

  it('Should rotate and persist the refresh token', () => {
    useAuthStore.getState().signIn({ ...session, refreshToken: 'refresh-1' })
    useAuthStore.getState().replaceToken(NEW_TOKEN, NEW_EXPIRY, {
      refreshToken: 'refresh-2',
      refreshTokenExpiresAt: '2026-10-16T10:00:00Z',
    })

    expect(useAuthStore.getState().refreshToken).toBe('refresh-2')
    expect(saveSession).toHaveBeenLastCalledWith(
      expect.objectContaining({
        refreshToken: 'refresh-2',
        refreshTokenExpiresAt: '2026-10-16T10:00:00Z',
        token: NEW_TOKEN,
      })
    )
  })

  it('Should keep the current refresh token when none is given', () => {
    useAuthStore.getState().signIn({ ...session, refreshToken: 'refresh-1' })
    useAuthStore.getState().replaceToken(NEW_TOKEN, NEW_EXPIRY)

    expect(useAuthStore.getState().refreshToken).toBe('refresh-1')
  })
})
