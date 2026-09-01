import { citizenQuickActions } from '../quick-actions'

const EXPECTED_ACTION_COUNT = 4
const EXPECTED_LABELS = [
  'Scan QR',
  'Share ID',
  'My Documents',
  'Verify Identity',
]
const CITIZEN_ROUTE_PREFIX = '/citizen/'

describe('citizenQuickActions', () => {
  it('Should expose the four dashboard actions', () => {
    const actionCount = citizenQuickActions.length
    const labels = citizenQuickActions.map((item) => item.label)
    expect(actionCount).toBe(EXPECTED_ACTION_COUNT)
    expect(labels).toEqual(EXPECTED_LABELS)
  })
  it('Should give every action a unique name and a citizen route', () => {
    const actionNames = citizenQuickActions.map((item) => item.name)
    const uniqueNames = new Set(actionNames)
    expect(uniqueNames.size).toBe(actionNames.length)
    citizenQuickActions.forEach((action) => {
      const routePath = String(action.href)
      const isValidRoute = routePath.startsWith(CITIZEN_ROUTE_PREFIX)
      expect(isValidRoute).toBe(true)
    })
  })
})
