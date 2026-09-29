import type { SecurityAlertNotice } from '@/services/security-service'
import { useSecurityNoticeStore } from '@/stores/security-notice-store'

const NOTICE: SecurityAlertNotice = {
  alertId: 'alert-1',
  deviceDescription: 'Chrome on Windows',
  location: 'London, United Kingdom',
  message: 'We detected a sign-in from London.',
  occurredAt: '2026-05-14T14:22:00Z',
  qrGenerationRestricted: true,
  qrRestrictedUntil: null,
  riskLevel: 'High',
  riskScore: 90,
  title: 'Possible impossible travel',
}

describe('useSecurityNoticeStore', () => {
  beforeEach(() => useSecurityNoticeStore.getState().clear())

  it('Should start without a notice', () => {
    expect(useSecurityNoticeStore.getState().notice).toBeNull()
  })

  it('Should hold the notice it is shown', () => {
    useSecurityNoticeStore.getState().show(NOTICE)
    expect(useSecurityNoticeStore.getState().notice).toEqual(NOTICE)
  })

  it('Should forget the notice once cleared', () => {
    useSecurityNoticeStore.getState().show(NOTICE)
    useSecurityNoticeStore.getState().clear()
    expect(useSecurityNoticeStore.getState().notice).toBeNull()
  })
})
