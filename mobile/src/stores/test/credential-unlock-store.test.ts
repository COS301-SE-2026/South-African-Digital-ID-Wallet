import {
  isUnlockValid,
  UNLOCK_TTL_MS,
  useCredentialUnlockStore,
} from '../credential-unlock-store'

const CRED_ID = 'c-1'

describe('credential unlock store', () => {
  beforeEach(() => {
    useCredentialUnlockStore.setState({ unlockedAt: null, unlockedId: null })
  })

  it('Should start locked', () => {
    const { unlockedAt, unlockedId } = useCredentialUnlockStore.getState()
    expect(isUnlockValid(CRED_ID, unlockedId, unlockedAt)).toBe(false)
  })

  it('Should grant an unlock for a single credential', () => {
    useCredentialUnlockStore.getState().unlock(CRED_ID)
    const { unlockedAt, unlockedId } = useCredentialUnlockStore.getState()
    expect(isUnlockValid(CRED_ID, unlockedId, unlockedAt)).toBe(true)
    expect(isUnlockValid('c-2', unlockedId, unlockedAt)).toBe(false)
  })

  it('Should expire the unlock after the TTL', () => {
    const now = Date.now()
    expect(isUnlockValid(CRED_ID, CRED_ID, now - UNLOCK_TTL_MS - 1)).toBe(false)
    expect(isUnlockValid(CRED_ID, CRED_ID, now - 1_000)).toBe(true)
  })

  it('Should treat an undefined credential id as locked', () => {
    useCredentialUnlockStore.getState().unlock(CRED_ID)
    const { unlockedAt, unlockedId } = useCredentialUnlockStore.getState()
    expect(isUnlockValid(undefined, unlockedId, unlockedAt)).toBe(false)
  })

  it('Should clear a granted unlock', () => {
    useCredentialUnlockStore.getState().unlock(CRED_ID)
    useCredentialUnlockStore.getState().clear()
    const { unlockedAt, unlockedId } = useCredentialUnlockStore.getState()
    expect(isUnlockValid(CRED_ID, unlockedId, unlockedAt)).toBe(false)
  })
})
