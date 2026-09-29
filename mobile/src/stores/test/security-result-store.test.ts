import type { SecureAccountResponse } from '@/services/security-service'
import { useSecurityResultStore } from '@/stores/security-result-store'

const RESULT: SecureAccountResponse = {
  action: 'ResetPassword',
  alertId: 'alert-1',
  devicesRemoved: 1,
  message: "We've logged you out of other devices.",
  nextSteps: ['Create a new, secure password now.'],
  requiresPasswordChange: true,
  title: 'Your account is secured',
}

describe('useSecurityResultStore', () => {
  beforeEach(() => useSecurityResultStore.setState({ results: {} }))

  it('Should start with no results', () => {
    expect(useSecurityResultStore.getState().results).toEqual({})
  })

  it('Should keep each result under its alert id', () => {
    useSecurityResultStore.getState().save('alert-1', RESULT)
    useSecurityResultStore
      .getState()
      .save('alert-2', { ...RESULT, alertId: 'alert-2' })

    const { results } = useSecurityResultStore.getState()
    expect(results['alert-1']).toEqual(RESULT)
    expect(results['alert-2']?.alertId).toBe('alert-2')
  })
})
