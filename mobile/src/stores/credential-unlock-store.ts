import { create } from 'zustand'

export const UNLOCK_TTL_MS = 2 * 60 * 1000

type CredentialUnlockState = {
  clear: () => void
  unlock: (credentialId: string) => void
  unlockedAt: number | null
  unlockedId: string | null
}

export const useCredentialUnlockStore = create<CredentialUnlockState>(
  (set) => ({
    clear: () => set({ unlockedAt: null, unlockedId: null }),
    unlock: (credentialId) =>
      set({ unlockedAt: Date.now(), unlockedId: credentialId }),
    unlockedAt: null,
    unlockedId: null,
  })
)

export const isUnlockValid = (
  credentialId: string | undefined,
  unlockedId: string | null,
  unlockedAt: number | null
): boolean =>
  credentialId !== undefined &&
  unlockedId === credentialId &&
  unlockedAt !== null &&
  Date.now() - unlockedAt < UNLOCK_TTL_MS
