import * as SecureStore from 'expo-secure-store'

import {
  clearSession,
  loadSession,
  saveSession,
  type PersistedSession,
} from '../secure-session'

jest.mock('expo-secure-store', () => ({
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 'passcode-only',
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}))

const session: PersistedSession = {
  expiresAt: '2026-08-16T10:00:00Z',
  token: 'jwt-token',
  user: { names: 'Thabo', role: 'citizen', surname: 'Mokoena', userId: 'u-1' },
}

describe('secure-session', () => {
  beforeEach(() => jest.clearAllMocks())
  it('Should persist behind a passcode-gated keychain entry', async () => {
    await saveSession(session)
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'flashid.session',
      JSON.stringify(session),
      { keychainAccessible: 'passcode-only' }
    )
  })
  it('Should return null when nothing is stored', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null)
    expect(await loadSession()).toBeNull()
  })
  it('Should round-trip a stored session', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
      JSON.stringify(session)
    )
    expect(await loadSession()).toEqual(session)
  })
  it('Should wipe the entry when the payload is corrupt', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue('{not-json')
    expect(await loadSession()).toBeNull()
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('flashid.session')
  })
  it('Should delete the entry on clear', async () => {
    await clearSession()
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('flashid.session')
  })
})
