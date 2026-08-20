import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CredentialStatsFilter } from '../credential-stats-filter'
import type { SearchResultRow } from '@/components/organisms/search-results-table/types'

const mockRows: SearchResultRow[] = [
  {
    id: '1',
    initials: 'TS',
    firstName: 'Thabo',
    surname: 'Ndlovu',
    idNumber: '860101 5385 088',
    dateJoined: '12 May 2024',
    expiresOn: '2034-05-12',
    status: 'active',
  },
  {
    id: '2',
    initials: 'JM',
    firstName: 'Jabulani',
    surname: 'Mthembu',
    idNumber: '920303 5678 083',
    dateJoined: '18 Apr 2024',
    expiresOn: '2034-04-18',
    status: 'suspended',
  },
]

describe('CredentialStatsFilter', () => {
  it('renders computed totals', () => {
    render(
      <CredentialStatsFilter rows={mockRows} value="all" onChange={jest.fn()} />
    )
    const totalCard = screen
      .getByText('Total Credentials')
      .closest('button') as HTMLElement
    expect(within(totalCard).getByText('2')).toBeInTheDocument()
    const activeCard = screen
      .getByText('Active Credentials')
      .closest('button') as HTMLElement
    expect(within(activeCard).getByText('1')).toBeInTheDocument()
    const suspendedCard = screen
      .getByText('Suspended Credentials')
      .closest('button') as HTMLElement
    expect(within(suspendedCard).getByText('1')).toBeInTheDocument()
  })

  it('calls onChange with the clicked filter', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()
    render(
      <CredentialStatsFilter rows={mockRows} value="all" onChange={onChange} />
    )
    await user.click(screen.getByText('Active Credentials'))
    expect(onChange).toHaveBeenCalledWith('active')
  })

  it('clears back to "all" when the active filter is clicked again', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()
    render(
      <CredentialStatsFilter
        rows={mockRows}
        value="active"
        onChange={onChange}
      />
    )
    await user.click(screen.getByText('Active Credentials'))
    expect(onChange).toHaveBeenCalledWith('all')
  })

  it('marks the currently selected filter as pressed', () => {
    render(
      <CredentialStatsFilter
        rows={mockRows}
        value="suspended"
        onChange={jest.fn()}
      />
    )

    const suspendedCard = screen
      .getByText('Suspended Credentials')
      .closest('button')
    const activeCard = screen.getByText('Active Credentials').closest('button')
    expect(suspendedCard).toHaveAttribute('aria-pressed', 'true')
    expect(activeCard).toHaveAttribute('aria-pressed', 'false')
  })

  it('supports keyboard activation via Enter', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()
    render(
      <CredentialStatsFilter rows={mockRows} value="all" onChange={onChange} />
    )
    const expiringCard = screen
      .getByText('Expiring Soon')
      .closest('button') as HTMLElement
    expiringCard.focus()
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith('expiring')
  })
})
