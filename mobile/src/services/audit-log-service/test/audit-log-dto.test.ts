import { Eye, ShieldAlert, ShieldCheck } from 'lucide-react-native'

import {
  humanizeAction,
  toAuditLogEntries,
  toAuditLogEntry,
} from '../audit-log-dto'
import type { AuditLogItemResponse } from '../types'

const item = (
  overrides: Partial<AuditLogItemResponse> = {}
): AuditLogItemResponse => ({
  action: 'UserLoggedIn',
  citizenName: 'Thabo Mokoena',
  citizenSaId: '9202204720082',
  createdAt: '2026-01-01T09:30:00Z',
  details: 'Signed in from mobile',
  id: 'a-1',
  ipAddress: '196.25.1.1',
  outcome: 'Success',
  performedBy: 'officer@flashid.co.za',
  ...overrides,
})

describe('humanizeAction', () => {
  it.each([
    ['UserLoggedIn', 'User logged in'],
    ['CredentialShared', 'Credential shared'],
    ['', 'Audit event'],
  ])('Should turn %s into %s', (input, expected) => {
    expect(humanizeAction(input)).toBe(expected)
  })
})

describe('toAuditLogEntry', () => {
  it.each([
    ['Success', ShieldCheck, 'soft-green'],
    ['Failed', ShieldAlert, 'soft-red'],
    ['Access', Eye, 'soft-blue'],
  ])('Should pick the %s icon and tone', (outcome, Icon, tone) => {
    const entry = toAuditLogEntry(item({ outcome }))
    expect(entry.Icon).toBe(Icon)
    expect(entry.tone).toBe(tone)
  })
  it('Should fall back to the success presentation for an unknown outcome', () => {
    const entry = toAuditLogEntry(item({ outcome: 'Mystery' }))
    expect(entry.Icon).toBe(ShieldCheck)
    expect(entry.tone).toBe('soft-green')
  })
  it('Should format the SA id into spaced groups', () => {
    expect(toAuditLogEntry(item()).saId).toBe('920220 4720 082')
  })
  it('Should leave the SA id null when absent', () => {
    expect(toAuditLogEntry(item({ citizenSaId: null })).saId).toBeNull()
  })
  it.each(['system', 'unknown', '', '  SYSTEM  '])(
    'Should discard the uninformative ip %s',
    (ipAddress) => {
      expect(toAuditLogEntry(item({ ipAddress })).ipAddress).toBeNull()
    }
  )
  it('Should keep a real ip address', () => {
    expect(toAuditLogEntry(item()).ipAddress).toBe('196.25.1.1')
  })
  it('Should map the actor, subject and title', () => {
    const entry = toAuditLogEntry(item())
    expect(entry.actor).toBe('officer@flashid.co.za')
    expect(entry.subject).toBe('Thabo Mokoena')
    expect(entry.title).toBe('User logged in')
  })
})

describe('toAuditLogEntries', () => {
  it('Should map a list of items', () => {
    expect(toAuditLogEntries([item(), item({ id: 'a-2' })])).toHaveLength(2)
  })
  it('Should return an empty list for undefined', () => {
    expect(toAuditLogEntries(undefined)).toEqual([])
  })
})
