import { render, screen } from '@testing-library/react-native'
import { ShieldCheck } from 'lucide-react-native'

import type { AuditLogEntry } from '@/services/audit-log-service'

import { AuditLogRow } from '../audit-log-row'

const entry = (overrides: Partial<AuditLogEntry> = {}): AuditLogEntry => ({
  actor: 'officer@flashid.co.za',
  details: 'Signed in from mobile',
  id: 'a-1',
  Icon: ShieldCheck,
  ipAddress: '196.25.1.1',
  outcome: 'Success',
  saId: '920220 4720 082',
  subject: 'Thabo Mokoena',
  time: '09:30',
  title: 'User logged in',
  tone: 'soft-green',
  ...overrides,
})

describe('<AuditLogRow/>', () => {
  it('Should render the title, details, time and outcome', async () => {
    await render(<AuditLogRow entry={entry()} testID="row" />)
    expect(screen.getByText('User logged in')).toBeTruthy()
    expect(screen.getByText('Signed in from mobile')).toBeTruthy()
    expect(screen.getByText('09:30')).toBeTruthy()
    expect(screen.getByText('Success')).toBeTruthy()
  })
  it('Should join the actor and subject', async () => {
    await render(<AuditLogRow entry={entry()} testID="row" />)
    expect(
      screen.getByText('officer@flashid.co.za • Thabo Mokoena')
    ).toBeTruthy()
  })
  it('Should show the actor alone when there is no subject', async () => {
    await render(<AuditLogRow entry={entry({ subject: null })} testID="row" />)
    expect(screen.getByText('officer@flashid.co.za')).toBeTruthy()
  })
  it('Should join the SA id and ip into a meta line', async () => {
    await render(<AuditLogRow entry={entry()} testID="row" />)
    expect(screen.getByTestId('row-meta')).toBeTruthy()
    expect(screen.getByText('920220 4720 082  ·  196.25.1.1')).toBeTruthy()
  })
  it('Should omit the meta line when both parts are missing', async () => {
    await render(
      <AuditLogRow
        entry={entry({ ipAddress: null, saId: null })}
        testID="row"
      />
    )
    expect(screen.queryByTestId('row-meta')).toBeNull()
  })
})
