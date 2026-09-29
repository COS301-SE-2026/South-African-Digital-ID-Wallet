import { create } from 'zustand'

import type { SecureAccountResponse } from '@/services/security-service'

type SecurityResultState = {
  clear: () => void
  results: Record<string, SecureAccountResponse>
  save: (alertId: string, result: SecureAccountResponse) => void
}

export const useSecurityResultStore = create<SecurityResultState>((set) => ({
  clear: () => set({ results: {} }),
  results: {},
  save: (alertId, result) =>
    set((state) => ({ results: { ...state.results, [alertId]: result } })),
}))
