import { LogIn, ShieldAlert } from 'lucide-react-native'

import { toActivityEntries, toIdentityStatus } from '../citizen-dashboard-dto'
import type { CredentialResponse } from '../types'

const DEFAULT_CREDENTIAL_ID = 'c-1'
const DEFAULT_ISSUER = 'DHA'
const DEFAULT_ISSUE_DATE = '2026-01-01T00:00:00Z'
const DEFAULT_STATUS = 'Active'
const DEFAULT_TITLE = 'National ID Card'
const DEFAULT_TYPE = 'IdentityDocument'

const createCredentialFixture = (
  overrides: Partial<CredentialResponse> = {}
): CredentialResponse => ({
  id: DEFAULT_CREDENTIAL_ID,
  issuedBy: DEFAULT_ISSUER,
  issueDate: DEFAULT_ISSUE_DATE,
  status: DEFAULT_STATUS,
  title: DEFAULT_TITLE,
  type: DEFAULT_TYPE,
  ...overrides,
})

describe('toIdentityStatus', () => {
  it('Should report verified for an active identity document', () => {
    const credentials = [createCredentialFixture()]
    const result = toIdentityStatus(credentials)
    expect(result.status).toBe('verified')
  })
  it('Should report pending for an inactive identity document', () => {
    const credentials = [createCredentialFixture({ status: 'Inactive' })]
    const result = toIdentityStatus(credentials)
    expect(result.status).toBe('pending')
  })
  it('Should report attention for a revoked identity document', () => {
    const credentials = [createCredentialFixture({ status: 'Revoked' })]
    const result = toIdentityStatus(credentials)
    expect(result.status).toBe('attention')
  })
  it('Should ignore a driver licence when deciding identity status', () => {
    const credentials = [createCredentialFixture({ type: 'DriversLicense' })]
    const result = toIdentityStatus(credentials)
    expect(result.status).toBe('attention')
  })
  it('Should report attention for undefined or empty credentials', () => {
    const resultUndefined = toIdentityStatus(undefined)
    const resultEmpty = toIdentityStatus([])
    expect(resultUndefined.status).toBe('attention')
    expect(resultEmpty.status).toBe('attention')
  })
})

describe('toActivityEntries', () => {
  const REF_TIME = new Date('2026-08-31T18:00:00')
  const SAMPLE_EVENT = {
    id: 'a-1',
    timestamp: '2026-08-31T09:30:00',
    title: 'Mobile App',
    type: 'UserLoggedIn',
  }
  const FAILURE_EVENT = {
    id: 'a-2',
    timestamp: '2026-08-31T09:30:00',
    title: 'Bad password',
    type: 'FailedLoginAttempt',
  }
  const UNKNOWN_EVENT = {
    id: 'a-3',
    timestamp: '2026-08-31T09:30:00',
    title: '',
    type: 'Xyz',
  }

  it('Should map a known audit event to its icon, title and tone', () => {
    const entries = toActivityEntries([SAMPLE_EVENT], REF_TIME)
    const [entry] = entries
    expect(entry).toMatchObject({
      description: 'Mobile App',
      Icon: LogIn,
      timestamp: 'Today, 09:30',
      title: 'Logged in',
      tone: 'soft-green',
    })
  })
  it('Should map failure events to the danger tone', () => {
    const entries = toActivityEntries([FAILURE_EVENT], REF_TIME)
    const [entry] = entries
    expect(entry.Icon).toBe(ShieldAlert)
    expect(entry.tone).toBe('soft-red')
  })
  it('Should fall back gracefully for an unknown event type', () => {
    const entries = toActivityEntries([UNKNOWN_EVENT], REF_TIME)
    const [entry] = entries
    expect(entry.title).toBe('Account activity')
    expect(entry.tone).toBe('neutral')
  })
  it('Should return an empty list for undefined activity', () => {
    const result = toActivityEntries(undefined)
    expect(result).toEqual([])
  })
})
