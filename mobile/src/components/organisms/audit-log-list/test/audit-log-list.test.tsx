import { fireEvent, render, screen } from '@testing-library/react-native'
import { ShieldCheck } from 'lucide-react-native'

import type { AuditLogEntry } from '@/services/audit-log-service'

import { AuditLogList } from '../audit-log-list'

const entry = (id: string): AuditLogEntry => ({
  actor: 'officer@flashid.co.za',
  details: 'Signed in',
  id,
  Icon: ShieldCheck,
  ipAddress: '196.25.1.1',
  outcome: 'Success',
  saId: '920220 4720 082',
  subject: 'Thabo Mokoena',
  time: '09:30',
  title: 'User logged in',
  tone: 'soft-green',
})

const base = {
  entries: [],
  hasNextPage: false,
  isError: false,
  isFetchingNextPage: false,
  isPending: false,
  onLoadMore: jest.fn(),
}

describe('<AuditLogList/>', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should show skeletons while pending', async () => {
    await render(<AuditLogList {...base} isPending />)
    expect(screen.getByTestId('audit-log-list-loading')).toBeTruthy()
  })
  it('Should show the error state', async () => {
    await render(<AuditLogList {...base} isError />)
    expect(screen.getByTestId('audit-log-list-error')).toBeTruthy()
  })
  it('Should show the empty state', async () => {
    await render(<AuditLogList {...base} />)
    expect(screen.getByTestId('audit-log-list-empty')).toBeTruthy()
  })
  it('Should render one row per entry', async () => {
    await render(
      <AuditLogList {...base} entries={[entry('a-1'), entry('a-2')]} />
    )
    expect(screen.getByTestId('audit-log-entry-a-1')).toBeTruthy()
    expect(screen.getByTestId('audit-log-entry-a-2')).toBeTruthy()
  })
  it('Should hide load-more on the last page', async () => {
    await render(<AuditLogList {...base} entries={[entry('a-1')]} />)
    expect(screen.queryByTestId('audit-log-load-more')).toBeNull()
  })
  it('Should request the next page', async () => {
    const onLoadMore = jest.fn()
    await render(
      <AuditLogList
        {...base}
        entries={[entry('a-1')]}
        hasNextPage
        onLoadMore={onLoadMore}
      />
    )
    await fireEvent.press(screen.getByTestId('audit-log-load-more'))
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })
  it('Should disable load-more while fetching', async () => {
    await render(
      <AuditLogList
        {...base}
        entries={[entry('a-1')]}
        hasNextPage
        isFetchingNextPage
      />
    )
    expect(screen.getByText('Loading...')).toBeTruthy()
    expect(
      screen.getByTestId('audit-log-load-more').props.accessibilityState
        .disabled
    ).toBe(true)
  })
})
