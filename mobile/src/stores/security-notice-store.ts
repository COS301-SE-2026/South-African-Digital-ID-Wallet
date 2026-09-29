import { create } from 'zustand'

import type { SecurityAlertNotice } from '@/services/security-service'

type SecurityNoticeState = {
  clear: () => void
  notice: SecurityAlertNotice | null
  show: (notice: SecurityAlertNotice) => void
}

export const useSecurityNoticeStore = create<SecurityNoticeState>((set) => ({
  clear: () => set({ notice: null }),
  notice: null,
  show: (notice) => set({ notice }),
}))
