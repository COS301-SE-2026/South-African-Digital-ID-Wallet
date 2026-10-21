import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuditLogTable } from '../audit-log-table'
import type { AuditLogItem, AuditLogTableProps } from '../types'

const row = (overrides: Partial<AuditLogItem> = {}): AuditLogItem => ({
  id: '1',
  createdAt: '2026-10-11T14:57:00Z',
  action: 'DeviceVerified',
  details: 'raw details',
  summary: 'User official@test.local verified and trusted a new device.',
  citizenName: null,
  citizenSaId: null,
  performedBy: 'Sipho Ndlovu',
  outcome: 'Success',
  ...overrides,
})

const renderTable = (overrides: Partial<AuditLogTableProps> = {}) => {
  const props: AuditLogTableProps = {
    rows: [row()],
    search: '',
    onSearchChange: jest.fn(),
    currentPage: 1,
    totalPages: 1,
    totalResults: 1,
    resultsPerPage: 7,
    onPageChange: jest.fn(),
    isLoading: false,
    category: 'work',
    onCategoryChange: jest.fn(),
    ...overrides,
  }
  render(<AuditLogTable {...props} />)
  return props
}

describe('AuditLogTable', () => {
  it('shows the summary when the row has no citizen', () => {
    renderTable()
    expect(
      screen.getByText(
        'User official@test.local verified and trusted a new device.'
      )
    ).toBeInTheDocument()
    expect(screen.queryByText('raw details')).not.toBeInTheDocument()
  })

  it('shows the citizen name and a spaced SA ID when present', () => {
    renderTable({
      rows: [
        row({
          action: 'OnboardCitizen',
          citizenName: 'Thandi Mokoena',
          citizenSaId: '9001015800081',
        }),
      ],
    })
    expect(screen.getByText('Thandi Mokoena')).toBeInTheDocument()
    expect(screen.getByText('900101 5800 081')).toBeInTheDocument()
  })

  it('marks the current category tab as selected', () => {
    renderTable({ category: 'work' })
    expect(screen.getByRole('tab', { name: 'Citizen work' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('reports a tab change to the parent', async () => {
    const user = userEvent.setup()
    const props = renderTable()
    await user.click(screen.getByRole('tab', { name: 'Account security' }))
    expect(props.onCategoryChange).toHaveBeenCalledWith('security')
  })
})
