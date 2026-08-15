import { setAuthToken } from '@/lib/api'
import type { LoginResponse } from '@/services'

import { useAuthStore } from '../auth-store'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
  setAuthToken: jest.fn(),
}))

const session: LoginResponse = {
  userId: 'u-1',
  role: 'citizen',
  names: 'Thabo',
  surname: 'Mokoena',
  token: 'jwt-token',
  expiresAt: '2026-08-16T10:00:00Z',
}

const pristine = useAuthStore.getState()

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState(pristine, true)
    jest.clearAllMocks()
  })
  it('Should start signed out', () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
  })
  it('Should store the session and arms the api client on sign in', () => {
    useAuthStore.getState().signIn(session)
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.token).toBe('jwt-token')
    expect(state.expiresAt).toBe('2026-08-16T10:00:00Z')
    expect(state.user).toEqual({
      userId: 'u-1',
      role: 'citizen',
      names: 'Thabo',
      surname: 'Mokoena',
    })
    expect(setAuthToken).toHaveBeenCalledWith('jwt-token')
  })
  it('Should clear session and disarm on signout', () => {
    useAuthStore.getState().signIn(session)
    useAuthStore.getState().signOut()
    const state = useAuthStore.getState()
    expect(state).toMatchObject({
      isAuthenticated: false,
      token: null,
      user: null,
      expiresAt: null,
    })
    expect(setAuthToken).toHaveBeenLastCalledWith(null)
  })
})
